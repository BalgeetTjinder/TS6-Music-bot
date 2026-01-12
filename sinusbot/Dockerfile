FROM sinusbot/docker:latest

# Копируем новый клиент TeamSpeak 3.6.2
USER root

# Удаляем старый клиент
RUN rm -rf /opt/sinusbot/TeamSpeak3-Client-linux_amd64/*

# Копируем новые файлы клиента
COPY --chown=sinusbot:sinusbot ts3client_linux_amd64 /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY --chown=sinusbot:sinusbot *.so* /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY --chown=sinusbot:sinusbot qt.conf /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY --chown=sinusbot:sinusbot openglblacklist.json /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY --chown=sinusbot:sinusbot error_report /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY --chown=sinusbot:sinusbot package_inst /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY --chown=sinusbot:sinusbot update /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY --chown=sinusbot:sinusbot QtWebEngineProcess /opt/sinusbot/TeamSpeak3-Client-linux_amd64/
COPY --chown=sinusbot:sinusbot ts3client_runscript.sh /opt/sinusbot/TeamSpeak3-Client-linux_amd64/

# Копируем директории
COPY --chown=sinusbot:sinusbot gfx /opt/sinusbot/TeamSpeak3-Client-linux_amd64/gfx/
COPY --chown=sinusbot:sinusbot html /opt/sinusbot/TeamSpeak3-Client-linux_amd64/html/
COPY --chown=sinusbot:sinusbot iconengines /opt/sinusbot/TeamSpeak3-Client-linux_amd64/iconengines/
COPY --chown=sinusbot:sinusbot imageformats /opt/sinusbot/TeamSpeak3-Client-linux_amd64/imageformats/
COPY --chown=sinusbot:sinusbot platforms /opt/sinusbot/TeamSpeak3-Client-linux_amd64/platforms/
COPY --chown=sinusbot:sinusbot qtwebengine_locales /opt/sinusbot/TeamSpeak3-Client-linux_amd64/qtwebengine_locales/
COPY --chown=sinusbot:sinusbot resources /opt/sinusbot/TeamSpeak3-Client-linux_amd64/resources/
COPY --chown=sinusbot:sinusbot sound /opt/sinusbot/TeamSpeak3-Client-linux_amd64/sound/
COPY --chown=sinusbot:sinusbot soundbackends /opt/sinusbot/TeamSpeak3-Client-linux_amd64/soundbackends/
COPY --chown=sinusbot:sinusbot sqldrivers /opt/sinusbot/TeamSpeak3-Client-linux_amd64/sqldrivers/
COPY --chown=sinusbot:sinusbot styles /opt/sinusbot/TeamSpeak3-Client-linux_amd64/styles/
COPY --chown=sinusbot:sinusbot translations /opt/sinusbot/TeamSpeak3-Client-linux_amd64/translations/
COPY --chown=sinusbot:sinusbot xcbglintegrations /opt/sinusbot/TeamSpeak3-Client-linux_amd64/xcbglintegrations/

# Устанавливаем права
RUN chmod +x /opt/sinusbot/TeamSpeak3-Client-linux_amd64/ts3client_linux_amd64

USER sinusbot
