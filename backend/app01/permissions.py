from rest_framework.permissions import BasePermission

class IsSessionAuthenticated(BasePermission):
    """
    使用 session['user_id'] 驗證是否已登入
    """
    def has_permission(self, request, view):
        return 'user_id' in request.session
