function buildGoogleMapsLink(stops, travelMode = "driving") {
    const origin = encodeURIComponent(stops[0]);
    const destination = encodeURIComponent(stops[stops.length - 1]);
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelMode}`;
    
    if (stops.length > 2) {
      const waypoints = stops.slice(1, -1).map(s => encodeURIComponent(s)).join("%7C");
      url += `&waypoints=${waypoints}`;
    }
    return url;
  }
  
  // Example usage:
  const stops = [
    "Victoria Peak, Hong Kong",
    "Tsim Sha Tsui, Hong Kong",
    "Mong Kok, Hong Kong",
    "Hong Kong Disneyland, Hong Kong"
  ];
  
  const link = buildGoogleMapsLink(stops, "driving");
  console.log(link);
  // User clicks this link → opens Google Maps app on phone
  