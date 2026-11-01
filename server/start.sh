#!/usr/bin/env bash
# Moteur local OVX — remplacez l'adresse par celle de votre site (laissez vide pour localhost uniquement)
export OVX_ORIGINS="https://ovortex.com,https://www.ovortex.com"
# export OVX_REALESRGAN="$HOME/outils/realesrgan-ncnn-vulkan/realesrgan-ncnn-vulkan"
# export OVX_MODELS="$HOME/outils/realesrgan-ncnn-vulkan/models"
cd "$(dirname "$0")" && node server.mjs
