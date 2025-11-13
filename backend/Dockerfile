FROM python:3.12-slim

WORKDIR /app

# Instaluj zależności systemowe
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Kopiuj plik requirements.txt (musisz go stworzyć)
COPY requirements.txt .

RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Instaluj zależności Python
RUN pip install --no-cache-dir -r requirements.txt

# Kopiuj cały kod backendu
COPY . .

# Eksponuj port
EXPOSE 8000

# Uruchom aplikację
CMD ["python", "server.py"]