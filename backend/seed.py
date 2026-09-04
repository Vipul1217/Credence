"""Run with: python seed.py
Populates the database with the same demo data used in the frontend mock."""
from app.database import SessionLocal, engine, Base
from app import models

Base.metadata.create_all(bind=engine)
db = SessionLocal()

applicants = [
    ("Ramesh Kumar", 812, "high", 20000, "Cart & Equipment"),
    ("Sunita Devi", 740, "high", 10000, "Sewing Equipment"),
    ("Iqbal Singh", 605, "medium", 20000, "Cart & Equipment"),
    ("Farida Bano", 480, "low", 50000, "Shop Renovation"),
    ("Manjeet Kaur", 690, "medium", 10000, "Raw Material"),
    ("Devendra Yadav", 830, "high", 20000, "Cart & Equipment"),
]
for name, score, band, amount, category in applicants:
    db.add(models.Applicant(name=name, score=score, band=band, amount=amount, category=category))

loans = [
    ("Anita Sharma", "active", 8400, "Sewing Equipment", "NFC"),
    ("Ravi Prasad", "active", 15200, "Cart & Equipment", "QR"),
    ("Neelam Gupta", "flagged", 4200, "Raw Material", "NFC"),
    ("Suresh Pal", "active", 19800, "Shop Renovation", "QR"),
]
for name, status, balance, category, mode in loans:
    db.add(models.Loan(name=name, status=status, balance=balance, category=category, mode=mode))

merchants = [
    ("Bansal Cart Suppliers", "Cart & Equipment", "Sadar Bazaar, Ludhiana", "NFC + QR", "verified"),
    ("Singh Sewing Traders", "Sewing Equipment", "Chowk Bazaar, Ludhiana", "QR only", "verified"),
    ("New Horizon Textiles", "Raw Material", "Gill Road, Ludhiana", "NFC only", "pending"),
    ("Kapoor Hardware", "Shop Renovation", "Model Town, Ludhiana", "NFC + QR", "pending"),
]
for name, category, location, reader, status in merchants:
    db.add(models.Merchant(name=name, category=category, location=location, reader_type=reader, verification_status=status))

db.add(models.SchemeConfig(
    purpose_categories=["Cart & Equipment", "Sewing Equipment", "Raw Material", "Shop Renovation"],
    amount_tiers=[10000, 20000, 50000],
    remote_mode_enabled=True,
))

for period in ["Jul 2026", "Jun 2026", "May 2026"]:
    db.add(models.Invoice(period_label=period, verification_volume=120))

db.commit()
db.close()
print("Seed data inserted.")
