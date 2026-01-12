FROM sinusbot/docker:latest

# Копируем новый клиент TeamSpeak 3.6.2
USER root

# Удаляем старый клиент
RUN rm -rf /opt/sinusbot/TeamSpeak3-Client-linux_amd64/*

# Копируем новые файлы клиента (используем UID 1000 вместо имени пользователя)
COPY ts3client_linux_amd64 /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY *.so* /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY qt.conf /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY openglblacklist.json /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY error_report /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY package_inst /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY update /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY QtWebEngineProcess /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY ts3client_runscript.sh /opt/sinusbot/TeamSpeak3-Client-linux_amd64/

# Копируем директории
COPY gfx /opt/sinusbot/TeamSpeak3-Client-linux_amd64/gfx/
COPY html /opt/sinusbot/TeamSpeak3-Client-linux_amd64/html/
COPY iconengines /opt/sinusbot/TeamSpeak3-Client-linux_amd64/iconengines/
COPY imageformats /opt/sinusbot/TeamSpeak3-Client-linux_amd64/imageformats/
COPY platforms /opt/sinusbot/TeamSpeak3-Client-linux_amd64/platforms/
COPY qtwebengine_locales /opt/sinusbot/TeamSpeak3-Client-linux_amd64/qtwebengine_locales/
COPY resources /opt/sinusbot/TeamSpeak3-Client-linux_amd64/resources/
COPY sound /opt/sinusbot/TeamSpeak3-Client-linux_amd64/sound/
COPY soundbackends /opt/sinusbot/TeamSpeak3-Client-linux_amd64/soundbackends/
COPY sqldrivers /opt/sinusbot/TeamSpeak3-Client-linux_amd64/sqldrivers/
COPY styles /opt/sinusbot/TeamSpeak3-Client-linux_amd64/styles/
COPY translations /opt/sinusbot/TeamSpeak3-Client-linux_amd64/translations/
COPY xcbglintegrations /opt/sinusbot/TeamSpeak3-Client-linux_amd64/xcbglintegrations/

# Устанавливаем права
RUN chmod +x /opt/sinusbot/TeamSpeak3-Client-linux_amd64/ts3client_linux_amd64 && \
    chown -R 1000:1000 /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
