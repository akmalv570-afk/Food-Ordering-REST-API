from django.db import models
from foods.models import Food
from django.conf import settings
from django.core.validators import MaxValueValidator


User = settings.AUTH_USER_MODEL


class PromoCode(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.PositiveIntegerField(validators=[MaxValueValidator(100)])
    is_active = models.BooleanField(default=True)
    valid_from = models.DateField()
    valid_to = models.DateField()


class Order(models.Model):
    STATUS_CHOICES = (
        ('new','New'),
        ('preparing','Preparing'),
        ('delivered','Delivered')
    )
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name='orders')
    address = models.CharField(max_length=200)
    total_price = models.DecimalField(max_digits=10,decimal_places=2,default=0)
    status = models.CharField(max_length=20,choices=STATUS_CHOICES,default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    promo_code = models.ForeignKey(PromoCode,on_delete=models.SET_NULL,null=True,blank=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    food = models.ForeignKey(Food,on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10,decimal_places=2)








