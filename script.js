// Canada Explorer App - JavaScript
class CanadaExplorer {
    constructor() {
        this.userLocation = { lat: 43.6532, lng: -79.3832 }; // Toronto coordinates
        this.points = 0;
        this.level = 1;
        this.visitedLocations = new Set(['train-station']);
        this.achievements = {
            'first-journey': true,
            'grocery-shopper': false,
            'explorer': false
        };
        
        this.locations = {
            'train-station': {
                name: 'Union Station',
                type: 'train',
                points: 50,
                lat: 43.6452,
                lng: -79.3806,
                visited: true
            },
            'grocery-store': {
                name: 'Loblaws',
                type: 'grocery',
                points: 30,
                lat: 43.6500,
                lng: -79.3800,
                visited: false
            },
            'bank': {
                name: 'TD Bank',
                type: 'bank',
                points: 40,
                lat: 43.6520,
                lng: -79.3820,
                visited: false
            },
            'hospital': {
                name: 'Toronto General Hospital',
                type: 'hospital',
                points: 60,
                lat: 43.6580,
                lng: -79.3900,
                visited: false
            },
            'library': {
                name: 'Toronto Public Library',
                type: 'library',
                points: 35,
                lat: 43.6480,
                lng: -79.3850,
                visited: false
            },
            'post-office': {
                name: 'Canada Post',
                type: 'post',
                points: 25,
                lat: 43.6550,
                lng: -79.3780,
                visited: false
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.renderMap();
        this.updateUI();
        this.simulateNearbyLocations();
    }
    
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Location card clicks
        document.querySelectorAll('.location-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const locationId = e.currentTarget.dataset.location;
                this.visitLocation(locationId);
            });
        });
        
        // Simulate location check-in
        document.querySelectorAll('.nearby-location').forEach(location => {
            location.addEventListener('click', (e) => {
                const locationId = e.currentTarget.dataset.location;
                this.visitLocation(locationId);
            });
        });
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }
    
    renderMap() {
        const mapContainer = document.getElementById('map');
        const locationMarkers = document.getElementById('location-markers');
        
        // Clear existing markers
        locationMarkers.innerHTML = '';
        
        // Add location markers
        Object.entries(this.locations).forEach(([id, location]) => {
            const marker = this.createLocationMarker(id, location);
            locationMarkers.appendChild(marker);
        });
    }
    
    createLocationMarker(id, location) {
        const marker = document.createElement('div');
        marker.className = 'location-marker';
        marker.dataset.location = id;
        
        // Calculate position (simplified for demo)
        const x = 20 + (location.lng - this.userLocation.lng) * 1000;
        const y = 50 + (location.lat - this.userLocation.lat) * 1000;
        
        marker.style.left = `${Math.max(10, Math.min(90, x))}%`;
        marker.style.top = `${Math.max(10, Math.min(90, y))}%`;
        
        const icon = document.createElement('div');
        icon.className = `marker-icon ${location.type}`;
        
        const iconClass = this.getLocationIcon(location.type);
        icon.innerHTML = `<i class="${iconClass}"></i>`;
        
        marker.appendChild(icon);
        
        // Add click handler
        marker.addEventListener('click', () => {
            this.visitLocation(id);
        });
        
        return marker;
    }
    
    getLocationIcon(type) {
        const icons = {
            'train': 'fas fa-train',
            'grocery': 'fas fa-shopping-cart',
            'bank': 'fas fa-university',
            'hospital': 'fas fa-hospital',
            'library': 'fas fa-book',
            'post': 'fas fa-mail-bulk'
        };
        return icons[type] || 'fas fa-map-marker-alt';
    }
    
    visitLocation(locationId) {
        if (this.visitedLocations.has(locationId)) {
            this.showToast('You\'ve already visited this location!');
            return;
        }
        
        const location = this.locations[locationId];
        if (!location) return;
        
        // Add to visited locations
        this.visitedLocations.add(locationId);
        location.visited = true;
        
        // Award points
        this.points += location.points;
        this.updateLevel();
        
        // Update achievements
        this.checkAchievements();
        
        // Show success message
        this.showToast(`+${location.points} points! Welcome to ${location.name}!`);
        
        // Update UI
        this.updateUI();
        this.renderMap();
        this.simulateNearbyLocations();
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.points / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.showToast(`Level up! You're now level ${this.level}!`);
        }
    }
    
    checkAchievements() {
        // Check grocery shopper achievement
        const groceryVisits = Array.from(this.visitedLocations).filter(id => 
            this.locations[id].type === 'grocery'
        ).length;
        
        if (groceryVisits >= 3 && !this.achievements['grocery-shopper']) {
            this.achievements['grocery-shopper'] = true;
            this.points += 100; // Bonus points
            this.showToast('Achievement unlocked: Grocery Shopper! +100 bonus points!');
        }
        
        // Check explorer achievement
        if (this.visitedLocations.size >= 10 && !this.achievements['explorer']) {
            this.achievements['explorer'] = true;
            this.points += 200; // Bonus points
            this.showToast('Achievement unlocked: Explorer! +200 bonus points!');
        }
    }
    
    simulateNearbyLocations() {
        const nearbyContainer = document.getElementById('nearby-locations');
        nearbyContainer.innerHTML = '';
        
        // Get unvisited locations sorted by distance
        const unvisitedLocations = Object.entries(this.locations)
            .filter(([id, location]) => !location.visited)
            .sort((a, b) => {
                const distA = this.calculateDistance(this.userLocation, a[1]);
                const distB = this.calculateDistance(this.userLocation, b[1]);
                return distA - distB;
            })
            .slice(0, 3); // Show top 3 nearby
        
        unvisitedLocations.forEach(([id, location]) => {
            const distance = this.calculateDistance(this.userLocation, location);
            const nearbyElement = this.createNearbyLocationElement(id, location, distance);
            nearbyContainer.appendChild(nearbyElement);
        });
    }
    
    createNearbyLocationElement(id, location, distance) {
        const element = document.createElement('div');
        element.className = 'nearby-location';
        element.dataset.location = id;
        
        const icon = document.createElement('div');
        icon.className = `nearby-location-icon ${location.type}`;
        icon.innerHTML = `<i class="${this.getLocationIcon(location.type)}"></i>`;
        
        const info = document.createElement('div');
        info.className = 'nearby-location-info';
        info.innerHTML = `
            <h4>${location.name}</h4>
            <p>Visit to earn ${location.points} points</p>
        `;
        
        const distanceEl = document.createElement('div');
        distanceEl.className = 'nearby-location-distance';
        distanceEl.textContent = `${distance.toFixed(1)} km away`;
        
        element.appendChild(icon);
        element.appendChild(info);
        element.appendChild(distanceEl);
        
        return element;
    }
    
    calculateDistance(loc1, loc2) {
        // Simplified distance calculation for demo
        const latDiff = loc1.lat - loc2.lat;
        const lngDiff = loc1.lng - loc2.lng;
        return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
    }
    
    updateUI() {
        // Update points and level
        document.getElementById('total-points').textContent = this.points;
        document.getElementById('user-level').textContent = `Level ${this.level}`;
        
        // Update location cards
        document.querySelectorAll('.location-card').forEach(card => {
            const locationId = card.dataset.location;
            const location = this.locations[locationId];
            const status = card.querySelector('.location-status');
            
            if (location.visited) {
                status.className = 'location-status visited';
                status.innerHTML = '<i class="fas fa-check-circle"></i><span>Visited</span>';
            } else {
                const distance = this.calculateDistance(this.userLocation, location);
                status.className = 'location-status';
                status.innerHTML = `<i class="fas fa-map-marker-alt"></i><span>${distance.toFixed(1)} km away</span>`;
            }
        });
        
        // Update achievements
        this.updateAchievements();
        
        // Update profile stats
        this.updateProfileStats();
    }
    
    updateAchievements() {
        const achievementCards = document.querySelectorAll('.achievement-card');
        
        // First Journey
        const firstJourney = achievementCards[0];
        if (this.achievements['first-journey']) {
            firstJourney.classList.add('completed');
        }
        
        // Grocery Shopper
        const groceryShopper = achievementCards[1];
        const groceryVisits = Array.from(this.visitedLocations).filter(id => 
            this.locations[id].type === 'grocery'
        ).length;
        
        const groceryProgress = groceryShopper.querySelector('.progress-fill');
        const groceryCount = groceryShopper.querySelector('.achievement-progress span');
        groceryProgress.style.width = `${(groceryVisits / 3) * 100}%`;
        groceryCount.textContent = `${groceryVisits}/3`;
        
        if (this.achievements['grocery-shopper']) {
            groceryShopper.classList.add('completed');
        }
        
        // Explorer
        const explorer = achievementCards[2];
        const explorerProgress = explorer.querySelector('.progress-fill');
        const explorerCount = explorer.querySelector('.achievement-progress span');
        explorerProgress.style.width = `${(this.visitedLocations.size / 10) * 100}%`;
        explorerCount.textContent = `${this.visitedLocations.size}/10`;
        
        if (this.achievements['explorer']) {
            explorer.classList.add('completed');
        }
    }
    
    updateProfileStats() {
        document.getElementById('total-visits').textContent = this.visitedLocations.size;
        
        // Calculate total distance (simplified)
        const totalDistance = this.visitedLocations.size * 0.6; // Rough estimate
        document.getElementById('total-distance').textContent = totalDistance.toFixed(1);
        
        // Days active (simplified)
        document.getElementById('days-active').textContent = '1';
    }
    
    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CanadaExplorer();
});

// Add some interactive features
document.addEventListener('click', (e) => {
    // Add ripple effect to buttons
    if (e.target.classList.contains('tab-btn') || e.target.closest('.tab-btn')) {
        const btn = e.target.closest('.tab-btn');
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.marginLeft = '-10px';
        ripple.style.marginTop = '-10px';
        
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
