function findSalonNearToUserBy4Km(userLatitude, salonLatitude, userLongitude, salonLongitude) {

    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    userLongitude = userLongitude * Math.PI / 180;
    salonLongitude = salonLongitude * Math.PI / 180;
    userLatitude = userLatitude * Math.PI / 180;
    salonLatitude = salonLatitude * Math.PI / 180;

    // Haversine formula 
    let dlon = salonLongitude - userLongitude;
    let dlat = salonLatitude - userLatitude;
    let a = Math.pow(Math.sin(dlat / 2), 2)
        + Math.cos(userLatitude) * Math.cos(salonLatitude)
        * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956 
    // for miles
    let r = 6371;

    // calculate the result
    return (c * r);
}

let pariChowkLat = 28.4643
let pariChowkLon = 77.5104

let knowlegeParkLat = 28.462671691964733
let knowlegeParkLon = 77.49622606804714
console.log(1.609344 * findSalonNearToUserBy4Km(pariChowkLat, knowlegeParkLat, pariChowkLon, knowlegeParkLon))


export default findSalonNearToUserBy4Km