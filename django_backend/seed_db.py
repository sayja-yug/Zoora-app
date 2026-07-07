import os
import re
import django
from decimal import Decimal

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_backend.settings')
django.setup()

from django.core.management import call_command
from api.models import Metric, Startup, User, UserRole

def run_migrations():
    print("Running migrations...")
    call_command('makemigrations', 'api')
    call_command('migrate')

def seed_metrics():
    print("Seeding metrics...")
    seed_file_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'migrations', '004_seed_metrics.sql')
    if not os.path.exists(seed_file_path):
        print(f"Metrics seed file not found at {seed_file_path}")
        return

    with open(seed_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract everything between VALUES and the final semicolon
    values_match = re.search(r'INSERT INTO metrics .*? VALUES\s*(.*);', content, re.DOTALL | re.IGNORECASE)
    if not values_match:
        print("Could not find INSERT values in seed script.")
        return

    values_str = values_match.group(1).strip()
    
    # We can split the tuples. Each tuple is enclosed in parentheses, separated by commas or newlines.
    # A robust way is to find all (...) patterns. Since prompts might have quotes, let's parse using regex or simple scanner.
    # Let's use a regex to capture each metric row:
    # Pattern: \((.*?)\) with handling for single quotes.
    # To keep it simple, since it's SQL syntax, we can write a small scanner to parse sql insert tuples.
    tuples = []
    current_tuple = []
    in_quotes = False
    quote_char = None
    escaped = False
    current_str = []
    
    i = 0
    while i < len(values_str):
        c = values_str[i]
        if escaped:
            current_str.append(c)
            escaped = False
        elif c == '\\':
            escaped = True
        elif c == "'" and not in_quotes:
            in_quotes = True
            quote_char = "'"
        elif c == "'" and in_quotes:
            # Check for escaped single quote in SQL: ''
            if i + 1 < len(values_str) and values_str[i+1] == "'":
                current_str.append("'")
                i += 1
            else:
                in_quotes = False
        elif c == '(' and not in_quotes:
            current_tuple = []
        elif c == ')' and not in_quotes:
            # End of tuple
            tuples.append(current_tuple)
        elif c == ',' and not in_quotes:
            pass # delimiter
        elif c in ['\r', '\n', '\t'] and not in_quotes:
            pass
        else:
            if in_quotes:
                current_str.append(c)
            else:
                # Accumulate unquoted values (numeric, NULL)
                # Find token boundary
                token = []
                while i < len(values_str) and values_str[i] not in [',', ')', '\r', '\n', '\t', ' ']:
                    token.append(values_str[i])
                    i += 1
                token_str = ''.join(token).strip()
                if token_str:
                    current_tuple.append(token_str)
                # backtrack to let standard loop handle delimiter/end
                i -= 1
        
        # If we finished a string segment
        if not in_quotes and quote_char:
            current_tuple.append(''.join(current_str))
            current_str = []
            quote_char = None
            
        i += 1

    # Now we have parsed tuples.
    # Each tuple structure should have:
    # 0: slug, 1: category, 2: name, 3: description, 4: type, 5: weight, 6: max_score, 7: extraction_prompt, 8: valid_min, 9: valid_max
    seeded_count = 0
    for t in tuples:
        if len(t) < 7:
            continue
        slug = t[0]
        category = t[1]
        name = t[2]
        description = t[3] if t[3] != 'NULL' else None
        metric_type = t[4]
        weight = Decimal(t[5])
        max_score = Decimal(t[6])
        extraction_prompt = t[7] if len(t) > 7 and t[7] != 'NULL' else None
        valid_min = Decimal(t[8]) if len(t) > 8 and t[8] != 'NULL' else None
        valid_max = Decimal(t[9]) if len(t) > 9 and t[9] != 'NULL' else None
        
        Metric.objects.update_or_create(
            slug=slug,
            defaults={
                'category': category,
                'name': name,
                'description': description,
                'type': metric_type,
                'weight': weight,
                'max_score': max_score,
                'extraction_prompt': extraction_prompt,
                'valid_min': valid_min,
                'valid_max': valid_max
            }
        )
        seeded_count += 1
        
    print(f"Successfully seeded {seeded_count} metrics.")

def seed_demo_data():
    print("Seeding demo startups and users...")
    
    # 1. NeuralBridge AI (Demo Startup)
    s1, _ = Startup.objects.get_or_create(
        name="NeuralBridge AI",
        defaults={
            "stage": "Series A",
            "sector": "Enterprise SaaS",
            "website": "https://neuralbridge.ai",
            "profile_completeness_pct": Decimal("87.00")
        }
    )
    
    # 2. Demo Founder User
    User.objects.get_or_create(
        email="founder@neuralbridge.ai",
        defaults={
            "password_hash": "founder123", # Plain text for simple mock login
            "role": UserRole.FOUNDER,
            "startup": s1
        }
    )
    
    # 3. Demo Investor User
    User.objects.get_or_create(
        email="investor@zoora.vc",
        defaults={
            "password_hash": "investor123",
            "role": UserRole.INVESTOR
        }
    )
    
    print("Demo data seeded successfully.")

if __name__ == '__main__':
    run_migrations()
    seed_metrics()
    seed_demo_data()
    print("Database seeding completed!")
