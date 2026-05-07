"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTiranaPlace = getTiranaPlace;
const tiranaPlaces = [
    { name: "Skanderbeg Square, Tirana", coords: [41.3276, 19.8187], street: "Sheshi Skenderbej", area: "Center" },
    { name: "Mother Teresa Square, Tirana", coords: [41.3188, 19.8214], street: "Sheshi Nene Tereza", area: "University District" },
    { name: "Air Albania Stadium, Tirana", coords: [41.3182, 19.8231], street: "Sheshi Italia", area: "Stadium District" },
    { name: "Toptani Shopping Center, Tirana", coords: [41.3271, 19.8242], street: "Rruga Abdi Toptani", area: "Center" },
    { name: "Clock Tower of Tirana, Tirana", coords: [41.3272, 19.8191], street: "Sheshi Skenderbej", area: "Center" },
    { name: "Et'hem Bey Mosque, Tirana", coords: [41.3273, 19.8194], street: "Sheshi Skenderbej", area: "Center" },
    { name: "Pyramid of Tirana, Tirana", coords: [41.3225, 19.8223], street: "Bulevardi Deshmoret e Kombit", area: "Center South" },
    { name: "Blloku, Tirana", coords: [41.3208, 19.8169], street: "Rruga Pjeter Bogdani", area: "Blloku" },
    { name: "Pazari i Ri, Tirana", coords: [41.3309, 19.8268], street: "Rruga Hoxha Tahsim", area: "East Center" },
    { name: "Komuna e Parisit, Tirana", coords: [41.3145, 19.8019], street: "Rruga Medar Shtylla", area: "Southwest" },
    { name: "Ali Demi, Tirana", coords: [41.3212, 19.8421], street: "Rruga Ali Demi", area: "East" },
    { name: "Kinostudio, Tirana", coords: [41.3452, 19.8563], street: "Rruga Aleksander Moisiu", area: "Northeast" },
    { name: "21 Dhjetori, Tirana", coords: [41.3221, 19.7936], street: "Rruga Muhamet Gjollesha", area: "West Center" },
    { name: "Medreseja, Tirana", coords: [41.3381, 19.8248], street: "Rruga Dibres", area: "North Center" },
    { name: "Don Bosko, Tirana", coords: [41.3395, 19.7925], street: "Rruga Don Bosko", area: "Northwest" },
    { name: "Astir, Tirana", coords: [41.3141, 19.7604], street: "Bulevardi Migjeni", area: "Far West" },
    { name: "Lapraka, Tirana", coords: [41.3477, 19.7867], street: "Rruga Dritan Hoxha", area: "Northwest" },
    { name: "Sauk, Tirana", coords: [41.2937, 19.8372], street: "Rruga Elbasanit", area: "Southeast" },
    { name: "Grand Park of Tirana, Tirana", coords: [41.3114, 19.8188], street: "Rruga Herman Gmeiner", area: "Lake Park" },
    { name: "Liqeni i Thate, Tirana", coords: [41.2972, 19.8078], street: "Rruga Liqeni i Thate", area: "Southwest" },
    { name: "New Boulevard, Tirana", coords: [41.3349, 19.8111], street: "Bulevardi i Ri", area: "North Center" },
    { name: "Youth Park, Tirana", coords: [41.3253, 19.8137], street: "Parku Rinia", area: "Center" },
    { name: "Farka Lake, Tirana", coords: [41.2945, 19.8841], street: "Rruga e Farkes", area: "Far East" },
    { name: "Myslym Shyri, Tirana", coords: [41.3237, 19.8071], street: "Rruga Myslym Shyri", area: "Center West" },
    { name: "Rruga e Kavajes, Tirana", coords: [41.3241, 19.8012], street: "Rruga e Kavajes", area: "West Center" },
    { name: "Rruga e Durresit, Tirana", coords: [41.3312, 19.8046], street: "Rruga e Durresit", area: "Northwest Center" },
    { name: "Bulevardi Bajram Curri, Tirana", coords: [41.3204, 19.8127], street: "Bulevardi Bajram Curri", area: "Center South" },
    { name: "Bulevardi Deshmoret e Kombit, Tirana", coords: [41.3232, 19.8198], street: "Bulevardi Deshmoret e Kombit", area: "Center" },
    { name: "Rruga e Elbasanit, Tirana", coords: [41.3165, 19.8304], street: "Rruga e Elbasanit", area: "East South" },
    { name: "University of Tirana, Tirana", coords: [41.3193, 19.8182], street: "Rruga e Elbasanit", area: "University District" },
    { name: "Tirana East Gate, Tirana", coords: [41.2868, 19.8724], street: "Autostrada TEG", area: "Far Southeast" },
    { name: "Casa Italia, Tirana", coords: [41.3533, 19.7748], street: "Autostrada Durres-Tirane", area: "Northwest" },
    { name: "Politechnic University of Tirana, Tirana", coords: [41.3185, 19.8239], street: "Sheshi Nene Tereza", area: "University District" },
    { name: "European University of Tirana, Tirana", coords: [41.314, 19.7932], street: "Bulevardi Gjergj Fishta", area: "West South" },
    { name: "Kristal Center, Tirana", coords: [41.3146, 19.7939], street: "Bulevardi Gjergj Fishta", area: "West South" },
    { name: "Ring Center, Tirana", coords: [41.3272, 19.8019], street: "Zogu i Zi", area: "West Center" },
    { name: "Regional Bus Terminal, Tirana", coords: [41.3524, 19.7511], street: "Terminali i Autobuseve", area: "West Edge" },
    { name: "Train Station Area, Tirana", coords: [41.3364, 19.8072], street: "Bulevardi Zogu I", area: "North Center" },
    { name: "University Hospital Center Mother Teresa, Tirana", coords: [41.3313, 19.8334], street: "Rruga e Dibres", area: "East Center" },
    { name: "Tirana International Bus Station, Tirana", coords: [41.3498, 19.7672], street: "Autostrada Durres-Tirane", area: "West Edge" },
    { name: "National Theatre of Opera and Ballet, Tirana", coords: [41.3287, 19.8201], street: "Sheshi Skenderbej", area: "Center" },
    { name: "National Historical Museum, Tirana", coords: [41.3288, 19.8177], street: "Sheshi Skenderbej", area: "Center" },
    { name: "Bunk'Art 2, Tirana", coords: [41.3275, 19.8216], street: "Rruga Murat Toptani", area: "Center" },
    { name: "Arena Center, Tirana", coords: [41.3179, 19.8237], street: "Rruga Lek Dukagjini", area: "Stadium District" },
    { name: "Pallati i Kongreseve, Tirana", coords: [41.3214, 19.8212], street: "Bulevardi Deshmoret e Kombit", area: "Center South" }
];
const placeByName = new Map(tiranaPlaces.map((place) => [place.name.toLowerCase(), place]));
function getTiranaPlace(name) {
    return placeByName.get(name.trim().toLowerCase());
}
exports.default = tiranaPlaces;
