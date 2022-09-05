var addModal = document.getElementById("myModal");
var closeBtn = document.getElementById("closeParsel");
var parselSave = document.getElementById("saveParsel");
var mapfcs = document.getElementById("map");
var inpclr = document.querySelectorAll("input");
var toggledata = -1;


var wktFortmat = new ol.format.WKT();
//katmanlarımız
const openStreetMapStandard1 = new ol.layer.Tile({
    source: new ol.source.OSM({
        attributions: "Belsis Parsel Uygulaması",
        visible: true,
        title: 'OSMStandart',
    })
});

const openStreetMapStamen = new ol.layer.Tile({
    source: new ol.source.Stamen({
        layer: 'watercolor',
        visible: false,
        title: 'OSMStamen'
    })
});

const source = new ol.source.Vector();
//harita çizildi
const vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.5)'
        }),
        stroke: new ol.style.Stroke({
            color: 'red',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33',
            }),
        }),
    }),
});
//edit için harita çizldi
const vector1 = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.5)'
        }),
        stroke: new ol.style.Stroke({
            color: 'blue',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'blue',
            }),
        }),
    }),
});
//harita yüklendi
var map = new ol.Map({
    controls: [
        new ol.control.FullScreen()
    ],
    target: 'map',
    layers: [openStreetMapStandard1, vector],
    view: new ol.View({
        center: ol.proj.fromLonLat([40.00, 42.00]),
        zoom: 4,
        maxZoom: 10,
        minZoom: 3
    })
});

//katmanlar grubu
var layersGroup = new ol.layer.Group({
    layers: [
        openStreetMapStandard1, vector
    ]
})

var layersGroup1 = new ol.layer.Group({
    layers: [
        openStreetMapStandard1, openStreetMapStamen, vector
    ]
})

//katman değiştirme
const layerElements = document.querySelectorAll('.sidebar > input[type=radio]');
var lfirst = true;
for (let layerElement of layerElements) {
    layerElement.addEventListener('change', function() {
        if (layerElement.value == "OSMStamen") {
            map.setLayerGroup(layersGroup1)
        } else if (layerElement.value == "OSMStandart") {
            map.setLayerGroup(layersGroup)
        }
    });
}

let draw;

const typeSelect = document.getElementById('type');

//sayfa yüklendiğinde
addInteractions();
GETALL();

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
    if (toggledata == -1) {
        map.removeInteraction(draw);
        var a = source.getFeatures();
        var b = a[a.length - 1];
        source.removeFeature(b);
        addModal.style.display = "";
        mapfcs.style.pointerEvents = "";
        typeSelect.style.pointerEvents = "";
        addInteractions();
    } else {
        addModal.style.display = "";
        mapfcs.style.pointerEvents = "";
        typeSelect.style.pointerEvents = "";
        addInteractions();
    }

});

//Ekleme ve Düzenleme sayfa kaydet
parselSave.addEventListener("click", () => {
    addModal.style.display = "";
    mapfcs.style.pointerEvents = "";
    typeSelect.style.pointerEvents = "";

    if (toggledata == -1) {
        var datas = source.getFeatures()
        const x = wktFortmat.writeFeature(datas[datas.length - 1])
        var data = {
            "Ulke": $("#myModal #Ulke").val(),
            "Sehir": $("#myModal #Sehir").val(),
            "Ilce": $("#myModal #Ilce").val(),
            "WktString": x
        }
        POST(data);
    } else {
        var data = {
            "Id": toggledata,
            "Ulke": $("#myModal #Ulke").val(),
            "Sehir": $("#myModal #Sehir").val(),
            "Ilce": $("#myModal #Ilce").val(),
            "WktString": $("#myModal #Wkt").val()
        }
        UPDATE(data);
        toggledata = -1;
    }

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
            console.log("Ekleme Başarılı");
        },
        error: function(data) {
            console.log(data.status + ':' + data.statusText, data.responseText);
        }
    });
    window.location.reload()
}

//veri tabanı getirme
function GETALL() {
    $.ajax({
        type: "GET",
        url: "https://localhost:5001/Parsel",
        contentType: 'application/json',
        dataType: 'JSON',
        success: function(data) {
            data.forEach(getir);
            btnSilHazırla()
            btnEditHazırla()
        }
    });
}
//veri tabanı getirme tablo aktarma
var tblbd = document.getElementById("tblBody");

function getir(item, index, arr) {
    //tablo oluşturma
    let tid = document.createElement("td");
    let tulke = document.createElement("td");
    let tsehir = document.createElement("td");
    let tilce = document.createElement("td");
    let tkrdnt = document.createElement("td");
    let tedit = document.createElement("td");
    let tdel = document.createElement("td");
    let btnedit = document.createElement("button");
    let btnsil = document.createElement("button");

    btnedit.type = "button";
    btnedit.innerHTML = "GÜNCELLE";
    btnedit.className = "edit btn btn-primary";
    btnedit.id = item.id;

    btnsil.type = "button";
    btnsil.innerHTML = "SİL";
    btnsil.className = "sil btn btn-danger";
    btnsil.id = item.id;

    tedit.appendChild(btnedit);
    tdel.appendChild(btnsil);

    tid.textContent = index + 1;
    tulke.textContent = item.ulke;
    tsehir.textContent = item.sehir;
    tilce.textContent = item.ilce;
    tkrdnt.textContent = item.wktString;

    let tr = document.createElement("tr");

    tr.appendChild(tid);
    tr.appendChild(tulke);
    tr.appendChild(tsehir);
    tr.appendChild(tilce);
    tr.appendChild(tkrdnt);
    tr.appendChild(tedit);
    tr.appendChild(tdel);

    tblbd.appendChild(tr);

    //feature ekleme
    const parcel = wktFortmat.readFeature(item.wktString, {
        dataProjection: 'EPSG:3857',
        featureProjection: 'EPSG:3857',
    });
    source.addFeature(parcel)

}
//SİL butonlarının dinleme olayları

var silBtn = document.getElementsByClassName("sil");

function btnSilHazırla() {
    for (var i = 0; i < silBtn.length; i++) {
        (function(index) {
            silBtn[index].addEventListener("click", () => {
                DELETE(silBtn[index].id)
            });
        })(i)
    }
}

//veri tabanı getirme
function DELETE(id) {
    $.ajax({
        type: "DELETE",
        url: "https://localhost:5001/Parsel/" + id,
        contentType: 'application/json',
        dataType: 'JSON',
        success: function() {
            console.log("Silme Başarılı");
        }
    });
    window.location.reload()
}

//Update butonlarının dinleme olayları

var updateBtn = document.getElementsByClassName("edit");

function btnEditHazırla() {
    for (var i = 0; i < updateBtn.length; i++) {
        (function(index) {
            updateBtn[index].addEventListener("click", () => {
                GET(updateBtn[index].id)
            });
        })(i)
    }
}

//veri tabanı id ye göre getirme
function GET(id) {
    $.ajax({
        type: "GET",
        url: "https://localhost:5001/Parsel/" + id,
        contentType: 'application/json',
        dataType: 'JSON',
        success: function(data) {
            addModal.style.display = "block";
            mapfcs.style.pointerEvents = "none";
            typeSelect.style.pointerEvents = "none";
            yerlestir(data)
            toggledata = id;
            console.log("Getirme Başarılı");
        },
        error: function(data) {
            console.log(data.status + ':' + data.statusText, data.responseText);
        }
    });
}

//modala yerleştirme
var mdlUlke = document.getElementById("Ulke");
var mdlSehir = document.getElementById("Sehir");
var mdlIlce = document.getElementById("Ilce");
var mdWkt = document.getElementById("Wkt");

function yerlestir(data) {
    mdlUlke.value = data.ulke;
    mdlSehir.value = data.sehir;
    mdlIlce.value = data.ilce;
    mdWkt.value = data.wktString;
}

//veri tabanı güncelleme
function UPDATE(data) {
    $.ajax({
        type: "PUT",
        url: "https://localhost:5001/Parsel",
        contentType: 'application/json',
        dataType: 'JSON',
        data: JSON.stringify(data),
        success: function() {
            console.log("Güncelleme Başarılı");
        },
        error: function(data) {
            console.log(data.status + ':' + data.statusText, data.responseText);
        }
    });
    window.location.reload()
}
//edit haritası
var nwmapbtn = document.getElementById("krdntedt");

var layersGroup2 = new ol.layer.Group({
    layers: [
        openStreetMapStandard1, vector1
    ]
})

nwmapbtn.addEventListener("click", () => {

    var data = {
        "Ulke": mdlUlke.value,
        "Sehir": mdlSehir.value,
        "Ilce": mdlIlce.value,
        "WktString": mdWkt.value
    }
    source.clear()

    map.setLayerGroup(layersGroup2)
    const parcel = wktFortmat.readFeature(data.WktString, {
        dataProjection: 'EPSG:3857',
        featureProjection: 'EPSG:3857',
    });
    source.addFeature(parcel)
    addModal.style.display = "";
    mapfcs.style.pointerEvents = "";
    typeSelect.style.pointerEvents = "";


    document.getElementById("OSMStandart").checked = true;
    addInteractions();
});