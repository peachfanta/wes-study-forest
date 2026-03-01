import { useEffect, useMemo, useRef, useState } from 'react';

const SDK_ID = 'spotify-player-sdk';

function parsePlaylistUri(linkOrUri) {
  if (!linkOrUri) return '';
  if (linkOrUri.startsWith('spotify:playlist:')) return linkOrUri;
  const match = linkOrUri.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? `spotify:playlist:${match[1]}` : '';
}

function parsePlaylistId(linkOrUri) {
  if (!linkOrUri) return '';
  if (linkOrUri.startsWith('spotify:playlist:')) {
    return linkOrUri.replace('spotify:playlist:', '');
  }
  const match = linkOrUri.match(/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : '';
}

function SpotifyPlayer({ token, playlist }) {
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [track, setTrack] = useState(null);
  const [paused, setPaused] = useState(true);
  const [error, setError] = useState('');

  const playlistUri = useMemo(() => parsePlaylistUri(playlist), [playlist]);
  const playlistId = useMemo(() => parsePlaylistId(playlist), [playlist]);

  useEffect(() => {
    if (!token) return undefined;

    if (!document.getElementById(SDK_ID)) {
      const script = document.createElement('script');
      script.id = SDK_ID;
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Study Forest Player',
        getOAuthToken: (cb) => cb(token),
        volume: 0.55,
      });

      player.addListener('ready', ({ device_id: id }) => {
        setDeviceId(id);
        setIsReady(true);
        setError('');
      });

      player.addListener('player_state_changed', (state) => {
        if (!state) return;
        setTrack(state.track_window.current_track);
        setPaused(state.paused);
      });

      player.addListener('authentication_error', ({ message }) => setError(message));
      player.addListener('account_error', ({ message }) => setError(message));
      player.addListener('initialization_error', ({ message }) => setError(message));
      player.addListener('playback_error', ({ message }) => setError(message));

      player.connect();
      playerRef.current = player;
    };

    return () => {
      if (playerRef.current) playerRef.current.disconnect();
      playerRef.current = null;
      setIsReady(false);
      setDeviceId('');
    };
  }, [token]);

  const startPlaylist = async () => {
    if (!token || !deviceId || !playlistUri) return;
    setError('');

    try {
      await fetch(`https://api.spotify.com/v1/me/player`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ device_ids: [deviceId], play: false }),
      });

      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context_uri: playlistUri }),
      });

      if (!response.ok) {
        throw new Error('Unable to start playback. Ensure Spotify Premium and valid token scopes.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const togglePlay = async () => {
    if (!playerRef.current) return;
    if (paused) {
      await playerRef.current.resume();
    } else {
      await playerRef.current.pause();
    }
  };

  const skipTrack = async () => {
    if (!playerRef.current) return;
    await playerRef.current.nextTrack();
  };

  return (
    <div className="glass-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Spotify Focus Player</h3>
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            isReady ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-700 text-slate-300'
          }`}
        >
          {isReady ? 'Connected' : 'Idle'}
        </span>
      </div>

      {!token && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            No token mode: embedded playlist works from link only, but advanced controls and live track state require OAuth + Spotify Premium.
          </p>
          {playlistId ? (
            <iframe
              title="Spotify Playlist Embed"
              src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl border border-slate-800"
            />
          ) : (
            <p className="text-xs text-amber-200">Add a valid Spotify playlist link to use no-token playback.</p>
          )}
        </div>
      )}

      {token && (
        <>
          <div className="mb-3 rounded-xl bg-slate-800/70 p-3">
            <p className="text-xs text-slate-400">Now Playing</p>
            <p className="truncate text-sm text-slate-100">{track?.name || 'No active track'}</p>
            <p className="truncate text-xs text-slate-400">
              {track?.artists?.map((artist) => artist.name).join(', ') || 'Start playlist to begin'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startPlaylist}
              className="rounded-lg bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-500/30"
            >
              Play Playlist
            </button>
            <button
              type="button"
              onClick={togglePlay}
              disabled={!isReady}
              className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-100 disabled:opacity-40"
            >
              {paused ? 'Play' : 'Pause'}
            </button>
            <button
              type="button"
              onClick={skipTrack}
              disabled={!isReady}
              className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-100 disabled:opacity-40"
            >
              Skip
            </button>
          </div>

          {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        </>
      )}
    </div>
  );
}

export default SpotifyPlayer;
