from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'role', 'company_name', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'full_name', 'company_name')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informasi Pribadi', {'fields': ('full_name', 'company_name', 'role')}),
        ('Izin', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'company_name', 'role', 'password1', 'password2'),
        }),
    )
