from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.CharField(source='perfil.cargo', read_only=True)
    celular = serializers.CharField(source='perfil.celular', read_only=True)
    avatar_url = serializers.URLField(source='perfil.avatar_url', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 
            'full_name', 'email', 'role', 'celular', 'avatar_url'
        ]

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        return name if name else obj.username
