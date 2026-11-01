@echo off
cd /d "%~dp0"

:: Configuration du moteur local OVX
set OVX_ORIGINS=https://votre-site.com
set OVX_FFMPEG=D:\internet\internet\ffmpeg\bin\ffmpeg.exe
set OVX_FFPROBE=D:\internet\internet\ffmpeg\bin\ffprobe.exe

:: Chemins pour l'agrandissement par IA Real-ESRGAN
set OVX_REALESRGAN=D:\internet\internet\realesrgan-ncnn-vulkan-v0.2.0-windows\realesrgan-ncnn-vulkan.exe
set OVX_MODELS=D:\internet\internet\realesrgan-ncnn-vulkan-v0.2.0-windows\models

:: Lancement du serveur
node server.mjs
pause