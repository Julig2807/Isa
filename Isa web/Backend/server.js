import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.static("frontend"));

function fechaColombia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

async function obtenerAccessToken() {
  const respuesta = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
          ":" +
          process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64")
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.REFRESH_TOKEN
    })
  });

  const datos = await respuesta.json();
  return datos.access_token;
}

function hashSimple(texto) {
  let hash = 0;

  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) % 1000000007;
  }

  return hash;
}

app.get("/api/cancion-del-dia", async (req, res) => {
  try {
    const fecha = fechaColombia();
    const token = await obtenerAccessToken();

    const respuesta = await fetch(
      `https://api.spotify.com/v1/playlists/${process.env.PLAYLIST_ID}/tracks?limit=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const datos = await respuesta.json();

    const canciones = datos.items
      .filter(item => item.track)
      .map(item => ({
        nombre: item.track.name,
        artista: item.track.artists[0].name,
        imagen: item.track.album.images[0]?.url,
        uri: item.track.uri
      }));

    const indice = hashSimple(fecha + process.env.PLAYLIST_ID) % canciones.length;
    const cancion = canciones[indice];

    res.json({
      fecha,
      cancion
    });
  } catch (error) {
    res.status(500).json({ error: "No se pudo obtener la canción" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor en http://127.0.0.1:${PORT}`);
});
