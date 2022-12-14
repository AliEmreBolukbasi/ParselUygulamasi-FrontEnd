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
    attributions: "Belsis Parsel Uygulaması",
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
function drawend(e) {
    if (edtToggleData == -1) {
        inpclr.forEach(function(inpt) {
            inpt.value = "";
        });
    }
    const c = wktFortmat.writeFeature(e.feature) //feature eklendi
    mdWkt.value = c;

    addModal.style.display = "block";
    mapfcs.style.pointerEvents = 'none';
    typeSelect.style.pointerEvents = 'none';
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
            source.clear(); //inputta tuttuğum için source gerek kalmadı
            map.setLayerGroup(layersGroup) // eski katmana geçiş
            for (var x = 0; x < tempsoruce.length; x++) {
                source.addFeature(tempsoruce[x]);
            }
            const parcel = wktFortmat.readFeature(data.WktString, {
                dataProjection: 'EPSG:3857',
                featureProjection: 'EPSG:3857',
            });
            source.addFeature(parcel)
            editclck = 0;
        }
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
            editclck = 0;
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
            btnDelPrepare()
            btnEditPrepare()
        },
        error: function(data) {
            console.log(data.status + ':' + data.statusText, data.responseText);
        }
    });
}

//sayfa yüklendiğinde veri tabanı getirme
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
            btnDelPrepare();
            btnEditPrepare();
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
    let btndel = document.createElement("button");

    btnedit.type = "button";
    btnedit.innerHTML = "GÜNCELLE";
    btnedit.className = "edit btn btn-primary";
    btnedit.id = item.id;

    btndel.type = "button";
    btndel.innerHTML = "SİL";
    btndel.className = "sil btn btn-danger";
    btndel.id = item.id;
    tedit.appendChild(btnedit);
    tdel.appendChild(btndel);

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
var silBtn = document.querySelectorAll(".sil");

function btnDelPrepare() {
    for (var i = 0; i < source.getFeatures().length; i++) {
        silBtn = document.querySelectorAll(".sil");
        tut = false; //listener içinde for a girmemesi için tut değişkeni oluşturdum
        (function(index) {
            silBtn[index].addEventListener("click", () => {
                if (tut == false) {
                    DELETE(silBtn[index].id, index);
                    tut = true;
                }
            });
        })(i)
    }
}
var tble = document.getElementById('tblBody');
//veri tabanı bağlantı

function DELETE(id, index) {
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
            btnDelPrepare();
            btnEditPrepare();
        },
        error: function(datas) {
            console.log(datas.status + ':' + datas.statusText, datas.responseText);
        },
    });
}

//Update butonlarının dinleme olayları
function btnEditPrepare() {
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
            tble.rows[edtToggleData].cells[1].innerHTML = datas.ulke; // id ye göre tablo güncelleme
            tble.rows[edtToggleData].cells[2].innerHTML = datas.sehir;
            tble.rows[edtToggleData].cells[3].innerHTML = datas.ilce;
            tble.rows[edtToggleData].cells[4].innerHTML = datas.wktString;
            crtToggleData, edtToggleData = -1;
            btnDelPrepare();
            btnEditPrepare();
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
    if (crtToggleData == -1) { //create de edite basıldığında
        var a = source.getFeatures();
        var b = a[a.length - 1];
        source.removeFeature(b);
    }
    if (editclck == 0) { // ilk defa çağrıldığında feature yedekle
        tempsoruce = source.getFeatures();
        editclck++;
    }
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
});