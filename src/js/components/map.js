/* global ymaps3 */
import {defaultMapPoints} from "../data/mapPoints.js";

export async function initMap(options = {}) {
    const points = options.points ?? defaultMapPoints;
    const pointById = new Map(points.map((p) => [p.id, p]));

    await ymaps3.ready;

    const {
        YMap,
        YMapTileDataSource,
        YMapLayer,
        YMapDefaultFeaturesLayer,
        YMapMarker
    } = ymaps3;

    const defaultLocation = {
        center: [143.5, 48.0],
        zoom: 6
    };

    const map = new YMap(
        document.getElementById('map'),
        {
            location: { ...defaultLocation },
            zoomRange: { min: 6, max: 9 },
            behaviors: ['pinchZoom', 'dblClick', 'magnifier'],
        }
    );

    // 1. Гибридные тайлы
    map.addChild(new YMapTileDataSource({
        id: 'maptiler-hybrid',
        raster: {
            type: 'ground',
            fetchTile: (x, y, z) =>
                `https://api.maptiler.com/tiles/satellite-v2/${z}/${x}/${y}.jpg?key=QI5eJBLCI2SI2zRZ5R2c`
        },
        zoomRange: { min: 0, max: 20 },
        clampMapZoom: true,
    }));

    // 2. Ground-слой
    map.addChild(new YMapLayer({
        id: 'maptiler-hybrid-layer',
        source: 'maptiler-hybrid',
        type: 'ground',
    }));

    // 3. Слой объектов
    map.addChild(new YMapDefaultFeaturesLayer({}));

    const filterEl = document.createElement('div');
    filterEl.className = 'map-color-filter';
    document.getElementById('map').appendChild(filterEl);

    // Элементы панели
    const panel       = document.getElementById('info-panel');
    const panelTitle  = document.getElementById('panel-title');
    const panelDesc   = document.getElementById('panel-desc');
    const panelImage  = document.getElementById('panel-image');
    const panelFish   = document.getElementById('panel-fish');
    const panelMethods = document.getElementById('panel-methods');
    const panelSeason = document.getElementById('panel-season');
    const panelClose  = document.getElementById('panel-close');

    function openPanel(point) {
        // Текст
        panelTitle.textContent  = point.title;
        panelDesc.textContent   = point.description;
        panelSeason.textContent = point.season ?? '—';

        // Картинка
        if (point.image) {
            panelImage.src = point.image;
            panelImage.alt = point.title;
            panelImage.style.display = 'block';
        } else {
            panelImage.style.display = 'none';
        }

        // Рыба
        panelFish.innerHTML = (point.fish ?? [])
            .map(f => `<li class="panel-list__item">${f}</li>`)
            .join('');

        // Методы ловли
        panelMethods.innerHTML = (point.methods ?? [])
            .map(m => `<li class="panel-list__item panel-list__item--method">${m}</li>`)
            .join('');

        panel.classList.add('open');
        document.getElementById('map').classList.add('shifted');

        setTimeout(() => {
            map.update({
                location: {
                    center: point.coordinates,
                    zoom: 9,
                    duration: 600
                }
            });
        }, 150);
    }

    function closePanel() {
        panel.classList.remove('open');
        document.getElementById('map').classList.remove('shifted');
        setTimeout(() => {
            map.update({
                location: {
                    ...defaultLocation,
                    duration: 600
                }
            });
        }, 150);
    }

    panelClose.addEventListener('click', closePanel);

    function openLocationById(id) {
        const point = pointById.get(id);
        if (point) openPanel(point);
    }

    // Маркеры с названием локации под пином
    points.forEach(point => {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerHTML = `
            <div class="marker-pin">
                <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="18" cy="41" rx="8" ry="3" fill="rgba(0,0,0,0.25)"/>
                    <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#00c2ff"/>
                    <path d="M18 2C9.16 2 2 9.16 2 18c0 12.5 16 24 16 24S34 30.5 34 18C34 9.16 26.84 2 18 2z" fill="#0085cc"/>
                    <circle cx="18" cy="17" r="7" fill="white" opacity="0.95"/>
                    <circle cx="18" cy="17" r="4" fill="#00c2ff"/>
                </svg>
            </div>
            <div class="marker-label">${point.title}</div>
            <div class="marker-tooltip">${point.short}</div>
        `;

        el.addEventListener('click', () => openPanel(point));

        map.addChild(new YMapMarker(
            { coordinates: [point.coordinates[0], point.coordinates[1] + 0.20], anchor: [18, 44] },
            el
        ));
    });

    return { openLocationById };
}