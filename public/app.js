const targetMap = {
	coordinates: [],
	map: {}, 
    markerArray: [],

	/*Build leaflet map
    */
	showMap() {
		this.map = L.map('map', {center: this.coordinates, zoom: 13,});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(this.map)

		/*
        ** Add a marker to the map
        */
		const marker = L.marker(this.coordinates)
            marker
            .addTo(this.map)
            .bindPopup('<p1><b>*You be here*</b><br></p1>')
            .openPopup()
	},

    /* Clear all markers on the map (except the current location)
    */
    clearMarkers() {
        if (this.markerArray.length === 0) return;  // No markers yet

        this.markerArray.forEach(marker=> {         // Remover marker
            this.map.removeLayer(marker)
        })
        this.markerArray.length = 0;                // Empty marker container
    },

    /* Add one vendor marker
    */
    addOneMarker(lat_long, biz_name) {
        this.markerArray.push(L.marker(lat_long)
                        .bindPopup(`<p1>${biz_name}</p1>`)
                        .addTo(this.map))
    },

    /* Add markers for each vendor in the group
    */
	addMarkers() {
        businesses.forEach(this_business => {
            this.addOneMarker([this_business.lat, this_business.long], this_business.name)
        })
	},

    /* Throw up all the vendors on the map
    */
    showBusinesses(business_group) {
        let businesses = business_group.map((vendor) => {
            let site = {
                name: vendor.name,
                lat: vendor.geocodes.main.latitude,
                long: vendor.geocodes.main.longitude
            };
            targetMap.addOneMarker([site.lat, site.long], site.name)
            
            console.log(site)
        })
    }
}

/* User's local coordinates
*/
async function getCoords(){
	const pos = await new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject)
	});
	return [pos.coords.latitude, pos.coords.longitude]
}

/* Hold everything off until we get the user's coordinates
*/
window.onload = async () => {
	const coords = await getCoords()
	targetMap.coordinates = coords
	targetMap.showMap()
    console.log("My location: " + targetMap.coordinates)
}

/* Fetch the 5 nearest businesses in the group from 4Square
*/
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

/* Clear the old markers out, then show the new set of vendors
*/
async function getVendors (vendor_category) {
    targetMap.clearMarkers()

    let businessGroup = await getFoursquare(vendor_category)
    targetMap.showBusinesses(businessGroup)  
}

vendorCategories = ["Coffee","Restaurants","Hotel","Market"]

for (let i=0; i < vendorCategories.length; i++) 
    document.getElementById(`b${i+1}`).addEventListener("click", function(){ getVendors(vendorCategories[i]) }) 
