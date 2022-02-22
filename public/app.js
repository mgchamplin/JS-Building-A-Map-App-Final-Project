// Create map:                                                       

const targetMap = {
	coordinates: [],
	map: {}, 
	markers: {},

	// build leaflet map
	showMap() {
		this.map = L.map('map', {
            center: this.coordinates,
            zoom: 13,
            });

		// add openstreetmap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(this.map)

		// create and add geolocation marker
		const marker = L.marker(this.coordinates)
            marker
            .addTo(this.map)
            .bindPopup('<p1><b>Your current location</b><br></p1>')
            .openPopup()
	},

    addOneMarker(lat_long, biz_name) {
        this.markers = L.marker(lat_long)
			.bindPopup(`<p1>${biz_name}</p1>`)
			.addTo(this.map)
    },

	// add business markers
	addMarkers() {
		for (var i = 0; i < this.businesses.length; i++) 
            this.addOneMarker([this.businesses[i].lat, this.businesses[i].long], this.businesses[i].name)
	},

    showBusinesses(business_group) {
        let businesses = business_group.map((biz) => {
            let site = {
                name: biz.name,
                lat: biz.geocodes.main.latitude,
                long: biz.geocodes.main.longitude
            };
            targetMap.addOneMarker([site.lat, site.long], site.name)
            
            console.log(site)
        })
    }
}

async function getCoords(){
	const pos = await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject)
	});
	return [pos.coords.latitude, pos.coords.longitude]
}

window.onload = async () => {
	const coords = await getCoords()
	targetMap.coordinates = coords
	targetMap.showMap()
    console.log("My location: " + targetMap.coordinates)
}

async function getFoursquare(bizCategory) {
    const options = {
        method: 'GET',
        headers: {
        Accept: 'application/json',
        Authorization: 'fsq3bGMbnnDlsN4TQJUVXNSjgs7V9tw4Kfe3M0pgG0ol67U='
        }
    }
    let latitude = targetMap.coordinates[0]
    let longitude = targetMap.coordinates[1]
    let response = await fetch(`https://api.foursquare.com/v3/places/search?&query=${bizCategory}&limit=5&ll=${latitude}%2C${longitude}`, options)

    let result = await response.text()
    let parsedResults = JSON.parse(result)
    let businesses = parsedResults.results
    console.log(businesses)
    return businesses
}

async function getCoffeeShops() {
    console.log("Find coffee")
    let businessGroup = await getFoursquare('Coffee')
    targetMap.showBusinesses(businessGroup)  
}
async function getRestaurants() {
    console.log("Find Restaurants")
    let businessGroup = await getFoursquare('Restaurants')
    targetMap.showBusinesses(businessGroup)  
}
async function getHotels() {
    console.log("Find Hotels")
    let businessGroup = await getFoursquare('Hotel')
    targetMap.showBusinesses(businessGroup)  
}
async function getMarkets() {
    console.log("Find Markets")
    let businessGroup = await getFoursquare('Restaurants')
    targetMap.showBusinesses(businessGroup)  
}

document.getElementById("b1").addEventListener("click", function(){ getCoffeeShops() })
document.getElementById("b2").addEventListener("click", function(){ getRestaurants() })
document.getElementById("b3").addEventListener("click", function(){ getHotels() })
document.getElementById("b4").addEventListener("click", function(){ getMarkets() })

//fsq3bGMbnnDlsN4TQJUVXNSjgs7V9tw4Kfe3M0pgG0ol67U=




