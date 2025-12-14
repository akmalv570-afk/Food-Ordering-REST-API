from .models import Order,OrderItem,PromoCode
from rest_framework import serializers
from foods.models import Food
from django.shortcuts import get_object_or_404
from datetime import date


class OrderItemCreateSerializer(serializers.Serializer):
    food_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    address = serializers.CharField()
    promo_code = serializers.CharField(required=False)
    items = OrderItemCreateSerializer(many=True)

    def create(self, validated_data):
        user = self.context['request'].user
        items_data = validated_data.pop('items')
        promo_code = validated_data.pop('promo_code', None)

        order = Order.objects.create(user=user,address=validated_data['address'])

        total_price = 0

        for item in items_data:
            food = get_object_or_404(Food, id=item['food_id'])
            price = food.price * item['quantity']

            OrderItem.objects.create(order=order,food=food,quantity=item['quantity'],price=price)

            total_price += price

        if promo_code:
            promo = PromoCode.objects.filter(
                code=promo_code,
                is_active=True,
                valid_from__lte=date.today(),
                valid_to__gte=date.today()
            ).first()

            if not promo:
                raise serializers.ValidationError({
                "promo_code": "Invalid or expired promo code"
                })

            discount = (total_price * promo.discount_percent) / 100
            total_price -= discount
            order.promo_code = promo


        order.total_price = total_price
        order.save()

        return order
    
class OrderItemSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(source='food.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['food_name','quantity','price']

class OrderListSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id','address','total_price','status','created_at','items']

class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True,read_only=True)
    promo_code = serializers.CharField(source='promo_code.code', read_only=True)

    class Meta:
        model = Order
        fields = ['id','address','status','promo_code','total_price','created_at','items']


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']


