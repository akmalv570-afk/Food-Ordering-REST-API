from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Admin'),
    )

    phone = models.CharField(max_length=13, blank=True)
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='user'
    )


