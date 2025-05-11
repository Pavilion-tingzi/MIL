# your_app/permissions.py
from rest_framework import permissions

class IsGroupLeader(permissions.BasePermission):
    """验证用户是否是组长"""
    def has_permission(self, request, view):
        user = request.user
        return user.group and user.group.leader == user