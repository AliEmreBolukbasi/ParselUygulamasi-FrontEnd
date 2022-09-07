var addModal = document.getElementById("myModal");
var closeBtn = document.getElementById("closeParsel");
var parselSave = document.getElementById("saveParsel");
var mapfcs = document.getElementById("map");
var inpclr = document.querySelectorAll("input");
var crtToggleData = -1; // update de ıd tutmak için ve update create ayrımı
var edtToggleData = -1; // update de index tutmak için

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
    draw = new ol.interaction.Draw({
        source: source,
        type: typeSelect.value,
    });
    map.addInteraction(draw);
    draw.on('drawend', drawend);
}
//çizim bitince
function drawend() {
    if (edtToggleData == -1) {
        inpclr.forEach(function(inpt) {
            inpt.value = "";
        });
    }
    drawput();
    addModal.style.display = "block";
    mapfcs.style.pointerEvents = 'none';
    typeSelect.style.pointerEvents = 'none';
}
//açılır pencere için ekleme
function drawput() {
    mdWkt.value = draw.Ah.toUpperCase() + "(";
    if (draw.Ah == "Point") {
        mdWkt.value += draw._v[0] + " " + draw._v[1];
    } else {
        mdWkt.value += "(";
        for (var x = 0; x < draw._v[0].length; x++) {
            mdWkt.value += draw._v[0][x][0] + " " + draw._v[0][x][1];
        }
        mdWkt.value += ")";
    }
    mdWkt.value += ")";
}

//ekleme update sayfa kapatma
closeBtn.addEventListener("click", () => {
    if (crtToggleData == -1) {
        var a = source.getFeatures();
        var b = a[a.length - 1];
        source.removeFeature(b);
        addModal.style.display = "";
        mapfcs.style.pointerEvents = "";
        typeSelect.style.pointerEvents = "";
        map.removeInteraction(draw);
        addInteractions();
    } else {
        addModal.style.display = "";
        mapfcs.style.pointerEvents = "";
        typeSelect.style.pointerEvents = "";
        map.removeInteraction(draw);
        addInteractions();
    }

});

//Ekleme ve Düzenleme sayfa kaydet
parselSave.addEventListener("click", () => {
    addModal.style.display = "";
    mapfcs.style.pointerEvents = "";
    typeSelect.style.pointerEvents = "";

    if (crtToggleData == -1) { // create için
        var data = {
            "Ulke": $("#myModal #Ulke").val(),
            "Sehir": $("#myModal #Sehir").val(),
            "Ilce": $("#myModal #Ilce").val(),
            "WktString": $("#myModal #Wkt").val()
        }
        if (editclck != 0) {
            source.clear();
            map.setLayerGroup(layersGroup)
            for (var x = 0; x < tempsoruce.length; x++) {
                source.addFeature(tempsoruce[x]);
            }
        }
        editclck = 0;
        const parcel = wktFortmat.readFeature(data.WktString, {
            dataProjection: 'EPSG:3857',
            featureProjection: 'EPSG:3857',
        });
        source.addFeature(parcel)
        POST(data);
    } else { // edit için 
        var data = {
            "Id": crtToggleData, //id, butonun id sine eşit
            "Ulke": $("#myModal #Ulke").val(),
            "Sehir": $("#myModal #Sehir").val(),
            "Ilce": $("#myModal #Ilce").val(),
            "WktString": $("#myModal #Wkt").val()
        }
        source.clear();
        map.setLayerGroup(layersGroup)
        for (var x = 0; x < tempsoruce.length; x++) {
            if (edtToggleData == x) {
                const parcel = wktFortmat.readFeature(data.WktString, {
                    dataProjection: 'EPSG:3857',
                    featureProjection: 'EPSG:3857',
                });
                source.addFeature(parcel)
            } else {
                source.addFeature(tempsoruce[x]);
            }
        }
        UPDATE(data);
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
        success: function(datas) {
            console.log("Ekleme Başarılı");
            tableCreate(datas)
            btnSilHazırla()
            btnEditHazırla()
        },
        error: function(data) {
            console.log(data.status + ':' + data.statusText, data.responseText);
        }
    });
}

//veri tabanı getirme
function GETALL() {
    $.ajax({
        type: "GET",
        url: "https://localhost:5001/Parsel",
        contentType: 'application/json',
        dataType: 'JSON',
        success: function(data) {
            for (var x = 0; x < data.length; x++) {
                tableCreate(data[x])
                const parcel = wktFortmat.readFeature(data[x].wktString, {
                    dataProjection: 'EPSG:3857',
                    featureProjection: 'EPSG:3857',
                });
                source.addFeature(parcel)
            }
            tempsoruce = source.getFeatures();
            btnSilHazırla();
            btnEditHazırla();
        }
    });
}
//veri tabanı getirme tablo aktarma
var tblbd = document.getElementById("tblBody");

function tableCreate(item) {
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

    tid.textContent = item.id;
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

    tr.id = item.id;

    tblbd.appendChild(tr);
}
//SİL butonlarının dinleme olayları
var tut = false;

function btnSilHazırla() {
    for (var i = 0; i < source.getFeatures().length; i++) {
        var silBtn = document.querySelectorAll(".sil");
        tut = false;
        debugger
            (function(index) {
                silBtn[index].addEventListener("click", () => {
                    if (tut == false) {
                        debugger
                        DELETE(silBtn[index].id, index);
                        tut = true;
                        debugger
                    }
                });
            })(i)
    }
}
var tble = document.getElementById('tblBody');
//veri tabanı bağlantı

function DELETE(id, index) {
    debugger
    $.ajax({
        type: "DELETE",
        url: "https://localhost:5001/Parsel/" + id,
        contentType: 'application/json',
        dataType: 'JSON',
        success: function() {
            console.log("Silme Başarılı");
            tble.deleteRow(index);
            var a = source.getFeatures();
            source.removeFeature(a[index]);
            btnSilHazırla();
            btnEditHazırla();
            debugger
        },
        error: function(datas) {
            console.log(datas.status + ':' + datas.statusText, datas.responseText);
        },
    });
}

//Update butonlarının dinleme olayları
function btnEditHazırla() {
    for (var i = 0; i < source.getFeatures().length; i++) {
        var updateBtn = document.querySelectorAll(".edit");
        tut = false;
        (function(index) {
            updateBtn[index].addEventListener("click", () => {
                if (tut == false) {
                    GET(updateBtn[index].id, index);
                    tut = true;
                }
            });
        })(i)
    }
}

//veri tabanı id ye göre getirme
function GET(id, index) {
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
            crtToggleData = id;
            edtToggleData = index;
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
        success: function(datas) {
            console.log("Güncelleme Başarılı")
            tble.rows[edtToggleData].cells[1].innerHTML = datas.ulke;
            tble.rows[edtToggleData].cells[2].innerHTML = datas.sehir;
            tble.rows[edtToggleData].cells[3].innerHTML = datas.ilce;
            tble.rows[edtToggleData].cells[4].innerHTML = datas.wktString;
            crtToggleData, edtToggleData = -1;
            btnSilHazırla();
            btnEditHazırla();
        },
        error: function(data) {
            console.log(data.status + ':' + data.statusText, data.responseText)
        }
    });

}
//edit haritası
var nwmapbtn = document.getElementById("krdntedt");

var layersGroup2 = new ol.layer.Group({
    layers: [
        openStreetMapStandard1, vector1
    ]
})

var tempsoruce;
var editclck = 0;
nwmapbtn.addEventListener("click", () => {
    editclck++;
    var data = {
        "Ulke": mdlUlke.value,
        "Sehir": mdlSehir.value,
        "Ilce": mdlIlce.value,
        "WktString": mdWkt.value
    }
    if (editclck == 0) {
        tempsoruce = source.getFeatures();
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
});