from django.db import models

class Food(models.Model):
    CATEGORY_CHOICES = (
        ('fastfood', 'Fast Food'),
        ('national', 'National Foods'),
        ('drink', 'Drinks'),
        ('dessert', 'Desserts')
    )

    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8,decimal_places=2)
    category = models.CharField(max_length=20,choices=CATEGORY_CHOICES)
    is_available = models.BooleanField(default=True)
    image = models.ImageField(upload_to='foods/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


