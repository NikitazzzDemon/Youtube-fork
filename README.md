# 🎬 GlassTube — Private YouTube VPS Proxy & Web Application

GlassTube — это стильный, приватный веб-клиент и видео-прокси для YouTube с неоновым матовым дизайном (Glassmorphism / Neumorphism), авторизацией, закладочным менеджером и автоматической интерактивной установкой на любой VPS под управлением Ubuntu / Debian.

---

## 🚀 Быстрый экспорт и деплой на GitHub из Google AI Studio

Если вы находитесь в интерфейсе **Google AI Studio / Build**:

1. **Скачать ZIP-архив с исходным кодом:**
   - Нажмите на иконку настроек / меню (в правом верхнем углу интерфейса AI Studio).
   - Выберите **Export project** -> **Download ZIP**.

2. **Загрузить проект прямо на GitHub:**
   - В правом верхнем углу меню AI Studio нажмите **Export** -> **Export to GitHub** (или **Push to GitHub**).
   - Авторизуйтесь через ваш аккаунт GitHub и выберите существующий или создайте новый публичный/приватный репозиторий.
   - Код автоматически закоммитится в ваш репозиторий со всеми файлами (`install.sh`, `server.ts`, `Dockerfile`, `docker-compose.yml` и т.д.).

---

## 🛠 Автоматическая интерактивная установка на VPS (1-Step Installer)

Скрипт установки `install.sh` полностью автоматизирует развертывание даже на сервере с замусоренной системой, свободными или занятыми портами и службами (Apache, legacy Nginx).

### Особенности скрипта:
- **Интерактивный ввод портов:** скрипт запрашивает желаемые порты для HTTP, HTTPS и внутреннего контейнера приложения.
- **Проверка конфликтов портов:** проверяет доступность портов через `ss` / `netstat` и очищает зависшие веб-серверы (Apache2 / Nginx).
- **Проверка домена и DNS:** проверяет правильность формата доменного имени и резолвинг A-записи домена на IP-адрес вашего VPS.
- **Caddy Web Server:** автоматический выпуск и продление SSL-сертификатов Let's Encrypt / ZeroSSL без сложной настройки Certbot.
- **UFW Firewall:** автоматическое открытие портов 22 (SSH), HTTP, HTTPS и порта приложения в брандмауэре Ubuntu.
- **Docker & Docker Compose:** автоматическая сборка изолированного Node.js 20 контейнера.

---

### 📥 Команда запуска установки на VPS

Подключитесь к вашему VPS по SSH под пользователем `root` (или с правами `sudo`) и выполните команду:

```bash
# Гарантированная команда установки на любом VPS (без ошибок /dev/fd и pipe):
curl -fsSL -o /tmp/install.sh https://raw.githubusercontent.com/NikitazzzDemon/Youtube-fork/main/install.sh && sudo bash /tmp/install.sh
```

*Если вы уже склонировали репозиторий локально на сервер:*

```bash
cd glasstube
chmod +x install.sh
sudo ./install.sh
```

---

## 📋 Пошаговый процесс интерактивной установки

При запуске скрипт проведет вас через 3 простых шага:

### Шаг 1: Настройка и проверка портов
```text
--- STEP 1: PORT CONFIGURATION & VERIFICATION ---

Enter HTTP Port [Default: 80]: 80
  ✓ Port 80 is valid.
Enter HTTPS Port [Default: 443]: 443
  ✓ Port 443 is valid.
Enter Internal App Port [Default: 3000]: 3000
  ✓ Port 3000 is valid.

Checking port availability on this server...
  ✓ Port 80 is free and ready.
  ✓ Port 443 is free and ready.
  ✓ Port 3000 is free and ready.
```

### Шаг 2: Ввод и проверка домена
```text
--- STEP 2: DOMAIN CONFIGURATION & DNS VERIFICATION ---

Enter your Domain Name (e.g. tube.yourdomain.com): tube.mydomain.com
  ✓ Domain format validated: tube.mydomain.com
  Verifying DNS record for tube.mydomain.com...
  ✓ DNS Resolution Success: tube.mydomain.com -> 123.45.67.89
  ✓ Excellent! Domain points directly to this VPS IP. Caddy Auto-SSL will work instantly.
```

### Шаг 3: Автоматический деплой
Скрипт самостоятельно:
1. Настроит правила UFW брандмауэра.
2. Установит Docker CE и веб-сервер Caddy.
3. Развернет файлы проекта в директорию `/opt/glasstube`.
4. Сгенерирует безопасный `JWT_SECRET` в `.env`.
5. Сформирует конфигурацию `/etc/caddy/Caddyfile` с обратным проксированием.
6. Запустит Docker Compose контейнер с автоперезапуском (`restart: always`).

---

## 🐳 Альтернативная ручная установка через Docker Compose

Если вы предпочитаете настроить все вручную:

```bash
# 1. Клонирование репозитория
git clone https://github.com/USERNAME/REPO.git /opt/glasstube
cd /opt/glasstube

# 2. Создание файла конфигурации .env
cat <<EOF > .env
NODE_ENV=production
PORT=3000
JWT_SECRET=$(openssl rand -hex 32)
DOMAIN=tube.mydomain.com
EOF

# 3. Запуск контейнера
docker compose up -d
```

---

## ⚙️ Полезные команды управления сервером

- **Просмотр логов Caddy (выпуск SSL):**
  ```bash
  journalctl -u caddy -f
  ```

- **Просмотр логов GlassTube приложения:**
  ```bash
  cd /opt/glasstube && docker compose logs -f
  ```

- **Перезапуск службы:**
  ```bash
  cd /opt/glasstube && docker compose restart
  ```

- **Статус процессов Docker:**
  ```bash
  docker ps
  ```

---

## 🛡 Лицензия & Требования
- **ОС:** Ubuntu 20.04 / 22.04 / 24.04 LTS, Debian 11 / 12
- **Минимальные ресурсы:** 1 vCPU, 1 GB RAM, 10 GB SSD
- **Требования к сети:** Открытый порт SSH и возможность привязать A-запись домена к IP сервера.
