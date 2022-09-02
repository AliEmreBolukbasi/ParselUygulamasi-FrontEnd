var addModal = document.getElementById("myModal");
var closeBtn = document.getElementById("closeParsel");
var parselSave = document.getElementById("saveParsel");
var mapfcs = document.getElementById("map");
var inpclr = document.querySelectorAll("input");

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
GET();

//çizim tipi değişince
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
//çizim bitince
function drawend() {
    addModal.style.display = "block";
    mapfcs.style.pointerEvents = 'none';
    typeSelect.style.pointerEvents = 'none';

    inpclr.forEach(function(inpt) {
        inpt.value = "";
    });


}
//ekleme sayfa kapatma
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

//ekleme sayfa kaydet
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
});

//ekleme veri tabanına gönder
function POST(data) {
    $.ajax({
        type: "POST",
        url: "https://localhost:5001/Parsel",
        contentType: 'application/json',
        data: JSON.stringify(data),
        dataType: 'JSON',
        success: function() {
            console.log("ekleme başarılı");
        },
        error: function(data) {
            console.log(data.status + ':' + data.statusText, data.responseText);
        }
    });
}

//veri tabanı getirme
function GET() {
    $.ajax({
        type: "GET",
        url: "https://localhost:5001/Parsel",
        contentType: 'application/json',
        dataType: 'JSON',
        success: function(data) {
            data.forEach(getir);
        }
    });
}
//veri tabanı getirme tablo aktarma
var tblbd = document.getElementById("tblBody");

function getir(item, index, arr) {
    console.log(item, index)
    let tid = document.createElement("td");
    let tulke = document.createElement("td");
    let tsehir = document.createElement("td");
    let tilce = document.createElement("td");
    let tedit = document.createElement("td");
    let tdel = document.createElement("td");
    let btnedit = document.createElement("button");
    let btnsil = document.createElement("button");

    btnedit.type = "button";
    btnedit.innerHTML = "GÜNCELLE";
    btnedit.className = "btn btn-primary";

    btnsil.type = "button";
    btnsil.innerHTML = "SİL";
    btnsil.className = "btn btn-danger";

    tedit.appendChild(btnedit);
    tdel.appendChild(btnsil);

    tid.textContent = index + 1;
    tulke.textContent = item.ulke;
    tsehir.textContent = item.sehir;
    tilce.textContent = item.ilce;

    let tr = document.createElement("tr");

    tr.appendChild(tid);
    tr.appendChild(tulke);
    tr.appendChild(tsehir);
    tr.appendChild(tilce);
    tr.appendChild(tedit);
    tr.appendChild(tdel);

    tblbd.appendChild(tr);
}