# Service Usage Guide
**How to use Supabase services in your React components**

---

## Quick Start

### Import Services

```javascript
import {
  propertyService,
  brokerService,
  partnerService,
  gatekeeperService,
  eventService,
  followUpService,
  noteService
} from './services';
```

---

## Property Service Examples

### Fetch All Properties

```javascript
import { propertyService } from './services';
import { useState, useEffect } from 'react';

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const data = await propertyService.getAll();
        setProperties(data);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load properties:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {properties.map(property => (
        <div key={property.id}>{property.address}</div>
      ))}
    </div>
  );
}
```

### Create a New Property

```javascript
async function handleCreateProperty(formData) {
  try {
    const newProperty = await propertyService.create({
      address: formData.address,
      purchase_price: formData.purchasePrice,
      sqft: formData.sqft,
      monthly_base_rent: formData.monthlyBaseRent,
      // ... other fields
    });

    console.log('Property created:', newProperty);
    // Update UI or navigate to new property
  } catch (err) {
    console.error('Failed to create property:', err);
    alert(err.message);
  }
}
```

### Update a Property

```javascript
async function handleUpdateProperty(propertyId, updates) {
  try {
    const updatedProperty = await propertyService.update(propertyId, {
      purchase_price: updates.purchasePrice,
      improvements: updates.improvements,
      // ... other fields
    });

    console.log('Property updated:', updatedProperty);
    // Refresh properties list
  } catch (err) {
    console.error('Failed to update property:', err);
    alert(err.message);
  }
}
```

### Delete a Property

```javascript
async function handleDeleteProperty(propertyId) {
  if (!window.confirm('Are you sure you want to delete this property?')) {
    return;
  }

  try {
    await propertyService.delete(propertyId);
    console.log('Property deleted');
    // Remove from UI
  } catch (err) {
    console.error('Failed to delete property:', err);
    alert(err.message);
  }
}
```

### Search Properties

```javascript
async function handleSearch(searchTerm) {
  try {
    const results = await propertyService.search(searchTerm);
    setProperties(results);
  } catch (err) {
    console.error('Search failed:', err);
  }
}
```

---

## Contacts Service Examples

### Fetch All Brokers

```javascript
import { brokerService } from './services';

async function loadBrokers() {
  try {
    const brokers = await brokerService.getAll();
    setBrokers(brokers);
  } catch (err) {
    console.error('Failed to load brokers:', err);
  }
}
```

### Create a New Broker

```javascript
async function handleCreateBroker(formData) {
  try {
    const newBroker = await brokerService.create({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      firm_name: formData.firmName,
      // ... other fields
    });

    console.log('Broker created:', newBroker);
  } catch (err) {
    console.error('Failed to create broker:', err);
  }
}
```

### Search Contacts

```javascript
// Search brokers
const brokerResults = await brokerService.search('John');

// Search partners
const partnerResults = await partnerService.search('Smith');

// Search gatekeepers
const gatekeeperResults = await gatekeeperService.search('Jane');
```

### Filter by Tags

```javascript
// Get all brokers with 'commercial' tag
const commercialBrokers = await brokerService.filterByTag('commercial');
```

---

## Events Service Examples

### Fetch Upcoming Events

```javascript
import { eventService } from './services';

async function loadUpcomingEvents() {
  try {
    const events = await eventService.getUpcoming();
    setUpcomingEvents(events);
  } catch (err) {
    console.error('Failed to load upcoming events:', err);
  }
}
```

### Create a New Event

```javascript
async function handleCreateEvent(formData) {
  try {
    const newEvent = await eventService.create({
      title: formData.title,
      date: formData.date, // YYYY-MM-DD
      time: formData.time,
      contact_type: 'broker', // or 'partner', 'gatekeeper'
      contact_id: formData.contactId,
      notes: formData.notes,
      location: formData.location,
    });

    console.log('Event created:', newEvent);
  } catch (err) {
    console.error('Failed to create event:', err);
  }
}
```

### Get Events by Date Range

```javascript
const startDate = '2025-01-01';
const endDate = '2025-01-31';

const januaryEvents = await eventService.getByDateRange(startDate, endDate);
```

### Get Events for a Contact

```javascript
const brokerEvents = await eventService.getByContact('broker', brokerId);
```

---

## Follow-ups Service Examples

### Fetch Pending Follow-ups

```javascript
import { followUpService } from './services';

async function loadPendingFollowUps() {
  try {
    const pending = await followUpService.getByStatus('pending');
    setPendingFollowUps(pending);
  } catch (err) {
    console.error('Failed to load follow-ups:', err);
  }
}
```

### Create a Follow-up

```javascript
async function handleCreateFollowUp(formData) {
  try {
    const newFollowUp = await followUpService.create({
      title: formData.title,
      due_date: formData.dueDate,
      priority: 'high', // 'low', 'medium', 'high'
      contact_type: 'broker',
      contact_id: formData.contactId,
      notes: formData.notes,
    });

    console.log('Follow-up created:', newFollowUp);
  } catch (err) {
    console.error('Failed to create follow-up:', err);
  }
}
```

### Mark Follow-up as Completed

```javascript
async function handleCompleteFollowUp(followUpId) {
  try {
    await followUpService.markCompleted(followUpId);
    console.log('Follow-up marked as completed');
    // Refresh follow-ups list
  } catch (err) {
    console.error('Failed to mark follow-up as completed:', err);
  }
}
```

### Get Overdue Follow-ups

```javascript
const overdue = await followUpService.getOverdue();
```

### Get Upcoming Follow-ups (Next 7 Days)

```javascript
const upcoming = await followUpService.getUpcoming(7);
```

---

## Notes Service Examples

### Fetch Notes for a Contact

```javascript
import { noteService } from './services';

async function loadContactNotes(contactType, contactId) {
  try {
    const notes = await noteService.getByContact(contactType, contactId);
    setNotes(notes);
  } catch (err) {
    console.error('Failed to load notes:', err);
  }
}
```

### Create a Note

```javascript
async function handleCreateNote(formData) {
  try {
    const newNote = await noteService.create({
      contact_type: 'broker',
      contact_id: formData.contactId,
      content: formData.content,
      category: formData.category, // 'call', 'meeting', 'email', etc.
      tags: formData.tags, // ['important', 'follow-up']
    });

    console.log('Note created:', newNote);
  } catch (err) {
    console.error('Failed to create note:', err);
  }
}
```

### Search Notes

```javascript
const searchResults = await noteService.search('meeting with');
```

### Filter Notes by Category

```javascript
const callNotes = await noteService.getByCategory('call');
```

---

## Error Handling Best Practices

### Use Try-Catch Blocks

Always wrap service calls in try-catch blocks:

```javascript
try {
  const data = await propertyService.getAll();
  // Success - update UI
} catch (err) {
  // Error - show user-friendly message
  console.error('Failed to fetch properties:', err);
  alert('Unable to load properties. Please try again.');
}
```

### Show Loading States

```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

async function loadData() {
  setLoading(true);
  setError(null);

  try {
    const data = await propertyService.getAll();
    setProperties(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
```

### Display User-Friendly Errors

```javascript
{error && (
  <div className="error-message">
    <p>Error: {error}</p>
    <button onClick={loadData}>Retry</button>
  </div>
)}
```

---

## Real-time Updates (Optional)

Supabase supports real-time subscriptions. Example:

```javascript
import { supabase } from './services';
import { useEffect } from 'react';

function PropertyList() {
  useEffect(() => {
    // Subscribe to property changes
    const subscription = supabase
      .channel('properties')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        (payload) => {
          console.log('Change detected:', payload);
          // Update UI based on payload
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
}
```

---

## Complete Example: Property Manager Component

```javascript
import React, { useState, useEffect } from 'react';
import { propertyService } from './services';

function PropertyManager() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load properties on mount
  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    setLoading(true);
    setError(null);

    try {
      const data = await propertyService.getAll();
      setProperties(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(formData) {
    try {
      const newProperty = await propertyService.create(formData);
      setProperties([newProperty, ...properties]);
      alert('Property created successfully!');
    } catch (err) {
      alert(`Failed to create property: ${err.message}`);
    }
  }

  async function handleUpdate(id, updates) {
    try {
      const updated = await propertyService.update(id, updates);
      setProperties(properties.map(p => p.id === id ? updated : p));
      alert('Property updated successfully!');
    } catch (err) {
      alert(`Failed to update property: ${err.message}`);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this property?')) return;

    try {
      await propertyService.delete(id);
      setProperties(properties.filter(p => p.id !== id));
      alert('Property deleted successfully!');
    } catch (err) {
      alert(`Failed to delete property: ${err.message}`);
    }
  }

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div>Error: {error} <button onClick={loadProperties}>Retry</button></div>;

  return (
    <div>
      <h1>Properties ({properties.length})</h1>
      {/* Render properties list */}
    </div>
  );
}

export default PropertyManager;
```

---

## Migration from localStorage

If you're currently using localStorage, replace calls like this:

```javascript
// OLD: localStorage
const properties = JSON.parse(localStorage.getItem('properties')) || [];
localStorage.setItem('properties', JSON.stringify(updatedProperties));

// NEW: Supabase
const properties = await propertyService.getAll();
await propertyService.create(newProperty);
await propertyService.update(propertyId, updates);
await propertyService.delete(propertyId);
```

---

## Tips

1. **Always handle errors** - Services throw errors that need to be caught
2. **Show loading states** - Database calls are async and take time
3. **Validate data** - Check required fields before calling services
4. **Use React hooks** - `useEffect` for loading, `useState` for data
5. **Don't forget user_id** - Services automatically add user_id from auth
6. **Test thoroughly** - Verify CRUD operations work before deploying

---

**See also:**
- [SETUP-GUIDE.md](../SETUP-GUIDE.md) - Complete setup instructions
- [BACKEND-INFRASTRUCTURE.md](./infrastructure/BACKEND-INFRASTRUCTURE.md) - Backend architecture
- Individual service files in `src/services/` - Full API documentation
