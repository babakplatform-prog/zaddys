from django.core.management.base import BaseCommand
from menu.models import Category, Product, ProductOptionGroup, ProductOption

class Command(BaseCommand):
    help = 'Automatically populates the Zaddys database with the complete menu structure'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding Zaddys Menu...")

        if Category.objects.exists() or Product.objects.exists():
            self.ensure_drinks()
            self.stdout.write(self.style.WARNING(
                "Menu data already exists; nothing was changed."
            ))
            return

        # 1. CREAMERY
        cat_creamery = Category.objects.create(name="Creamery")
        Product.objects.create(name="Mini Ice Cream Cake", category=cat_creamery, price=4000, description="Artisanal ice cream cake made for you.")
        Product.objects.create(name="Large Ice Cream Cake", category=cat_creamery, price=6500, description="Artisanal ice cream cake made for you.")
        
        cake_quote = Product.objects.create(name="Custom Celebration Ice Cream Cakes", category=cat_creamery, price=0, description="Perfect for celebrations. Available in different sizes and custom designs.", is_custom_quote=True)
        
        Product.objects.create(name="Fruit Pops (Standard)", category=cat_creamery, price=12500, description="A refreshing box of freshly prepared goodness.")
        Product.objects.create(name="Fruit Pop Box (Large)", category=cat_creamery, price=17000, description="A refreshing box of freshly prepared goodness.")

        # 2. SIGNATURE NOODLES
        cat_noodles = Category.objects.create(name="Signature Noodles")
        
        noodle_items = [
            ("Chicken Noodles Peppersoup", 8000),
            ("Spicy Suya Beef Noodles peppersoup", 6500),
            ("Garlic Butter Shrimp Noodles peppersoup", 9500),
            ("Triple Protein Noodles peppersoup", 12500),
        ]
        
        for name, price in noodle_items:
            prod = Product.objects.create(name=name, category=cat_noodles, price=price, description="Served piping hot in signature peppersoup broth.")
            
            # Add Noodle Type (Radio)
            g1 = ProductOptionGroup.objects.create(product=prod, name="Noodle Type", is_required=True, is_multiple=False)
            ProductOption.objects.create(group=g1, name="Egg Noodles", price_extra=0)
            ProductOption.objects.create(group=g1, name="Classic Noodles", price_extra=0)

            # Add Options (Checkboxes)
            g2 = ProductOptionGroup.objects.create(product=prod, name="Optional Add-ons", is_required=False, is_multiple=True)
            for opt_name, opt_price in [("Mild Pepper", 0), ("Medium Pepper", 0), ("Hot Pepper", 0), ("Extra Hot Pepper", 0), ("Soft-Boiled Egg", 500), ("Extra Chicken", 1500), ("Extra Beef", 1500), ("Extra Shrimp", 2000)]:
                ProductOption.objects.create(group=g2, name=opt_name, price_extra=opt_price)

        # 3. LOADED FRIES
        cat_fries = Category.objects.create(name="Loaded Fries")
        Product.objects.create(name="Beef Loaded Fries", category=cat_fries, price=8000, description="Crispy fries loaded with seasoned beef and toppings.")
        Product.objects.create(name="Chicken Loaded Fries", category=cat_fries, price=9500, description="Crispy fries loaded with tender chicken chunks.")
        Product.objects.create(name="Chicken & Shrimp Loaded Fries", category=cat_fries, price=12000, description="The ultimate protein fusion fries.")

        # 4. CHICKEN WINGS
        cat_wings = Category.objects.create(name="Chicken Wings")
        wings_prod = Product.objects.create(name="Signature Chicken Wings", category=cat_wings, price=4500, description="Juicy wings tossed in your choice of signature sauce.")
        
        w_group = ProductOptionGroup.objects.create(product=wings_prod, name="Quantity", is_required=True, is_multiple=False)
        ProductOption.objects.create(group=w_group, name="6 Pieces", price_extra=0)
        ProductOption.objects.create(group=w_group, name="10 Pieces", price_extra=3500)
        ProductOption.objects.create(group=w_group, name="15 Pieces", price_extra=7000)

        s_group = ProductOptionGroup.objects.create(product=wings_prod, name="Sauce Options", is_required=True, is_multiple=False)
        ProductOption.objects.create(group=s_group, name="BBQ", price_extra=0)
        ProductOption.objects.create(group=s_group, name="Honey Garlic", price_extra=0)
        ProductOption.objects.create(group=s_group, name="Sweet Chilli", price_extra=0)

        # 5. SIGNATURE WRAPS & OTHERS
        cat_wraps = Category.objects.create(name="Signature Wraps")
        Product.objects.create(name="Beef Wrap", category=cat_wraps, price=3500, description="Wrapped to perfection.")
        Product.objects.create(name="Chicken Wrap", category=cat_wraps, price=4000, description="Juicy chicken wrapped fresh.")
        Product.objects.create(name="Chicken & Beef Wrap", category=cat_wraps, price=4500, description="Double protein wrap.")

        cat_salad = Category.objects.create(name="Chicken Salad")
        Product.objects.create(name="Chicken Salad", category=cat_salad, price=3500, description="Fresh crisp greens with tender grilled chicken.")

        cat_croissant = Category.objects.create(name="Croissants")
        for c_name, c_price in [("Butter", 3000), ("Chocolate", 3500), ("Beef", 4000), ("Chicken", 4500)]:
            Product.objects.create(name=f"{c_name} Croissant", category=cat_croissant, price=c_price, description="Flaky, buttery bakery perfection.")

        # 6. MOMENT BOX
        cat_box = Category.objects.create(name="Moment Box")
        Product.objects.create(name="The Moment Box (Custom Bundle)", category=cat_box, price=13750, description="Build your own custom box. Main + Side + Dessert + Drink + Extras with a 4% discount applied automatically!", is_custom_quote=False)

        self.ensure_drinks()

        self.stdout.write(self.style.SUCCESS("Successfully seeded all Zaddys menu categories and items!"))

    def ensure_drinks(self):
        drinks_category, _ = Category.objects.get_or_create(name="Drinks")
        drinks = [
            ("Zaddy's Chapman", 1800, "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800"),
            ("Fresh Fruit Juice", 2200, "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800"),
            ("Creamy Milkshake", 2800, "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800"),
            ("Sparkling Water", 1000, "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800"),
        ]
        for name, price, image in drinks:
            Product.objects.get_or_create(
                name=name,
                category=drinks_category,
                defaults={
                    'price': price,
                    'description': 'Chilled and ready to complete your order.',
                    'image': image,
                },
            )