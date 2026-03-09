from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Perfil

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.CharField(source='perfil.cargo', required=False)
    celular = serializers.CharField(source='perfil.celular', required=False, allow_blank=True)
    avatar_url = serializers.URLField(source='perfil.avatar_url', required=False, allow_null=True, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 
            'full_name', 'email', 'role', 'celular', 'avatar_url', 'password'
        ]

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else obj.username

    def update(self, instance, validated_data):
        perfil_data = validated_data.pop('perfil', {})
        
        # Atualiza dados do usuário
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Atualiza ou cria o perfil
        perfil, created = Perfil.objects.get_or_create(user=instance)
        for attr, value in perfil_data.items():
            setattr(perfil, attr, value)
        perfil.save()

        return instance

    def create(self, validated_data):
        perfil_data = validated_data.pop('perfil', {})
        password = validated_data.pop('password', 'Sigoq@123')
        
        # Cria usuário com senha criptografada
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        # Cria perfil
        Perfil.objects.create(user=user, **perfil_data)
        
        return user
