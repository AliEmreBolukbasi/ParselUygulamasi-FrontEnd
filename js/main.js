var addModal = document.getElementById("myModal");
var closeBtn = document.getElementById("closeParsel");
var parselSave = document.getElementById("saveParsel");
var mapfcs = document.getElementById("map");

var wktFortmat = new ol.format.WKT();

const raster = new ol.layer.Tile({
    source: new ol.source.OSM({
        attributions: "Belsis Parsel Uygulaması"
    })
});

//const stamen = new ol.layer.Tile({
//    source: new ol.source.Stamen({
//        layer: 'watercolor'
//    })
//});

const source = new ol.source.Vector();

const vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.5)',
        }),
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 2,
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33',
            }),
        }),
    }),
});

var map = new ol.Map({
    controls: [
        new ol.control.FullScreen()
    ],
    target: 'map',
    layers: [raster, vector],
    view: new ol.View({
        center: ol.proj.fromLonLat([40.00, 42.00]),
        zoom: 4,
        maxZoom: 10,
        minZoom: 3,
        rotation: 1

    })
});




let draw;

const typeSelect = document.getElementById('type');

//sayfa yüklendiğinde
addInteractions();

typeSelect.onchange = () => {
    map.removeInteraction(draw);
    addInteractions();
};

function addInteractions() {
    if (addModal.style.display == "") {
        draw = new ol.interaction.Draw({
            source: source,
            type: typeSelect.value,
        });
        map.addInteraction(draw);
        draw.on('drawend', drawend);
    }
}

function drawend() {
    addModal.style.display = "block";
    mapfcs.style.pointerEvents = 'none';
    typeSelect.style.pointerEvents = 'none';
}

closeBtn.addEventListener("click", () => {
    map.removeInteraction(draw);
    var a = source.getFeatures();
    var b = a[a.length - 1];
    source.removeFeature(b);
    addModal.style.display = "";
    mapfcs.style.pointerEvents = "";
    typeSelect.style.pointerEvents = "";
    addInteractions();
});

parselSave.addEventListener("click", () => {
    var datas = source.getFeatures()
    const x = wktFortmat.writeFeature(datas[datas.length - 1])

    var data = {
        "Ulke": $("#myModal #Ulke").val(),
        "Sehir": $("#myModal #Sehir").val(),
        "Ilce": $("#myModal #Ilce").val()
    }

    addModal.style.display = "";
    mapfcs.style.pointerEvents = "";
    typeSelect.style.pointerEvents = "";
    POST(data);
    GET();
    debugger;
});

function POST(data) {
    $.ajax({
        type: "POST",
        url: "https://localhost:5001/Parsel",
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'JSON',
        success: function(res) {
            console.log(res);
            alert(res);
        },
        error: function(data) {
            console.log(data.status + ':' + data.statusText, data.responseText);
        }
    });
}

function GET() {
    $.ajax({
        type: "GET",
        url: "https://localhost:5001/Parsel",
        contentType: 'application/json',
        success: function(res) {
            console.log(res);
            alert(res);
        }
    });
}

function getir(item, index, arr) {
    debugger;
}