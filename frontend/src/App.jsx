import { useEffect, useState } from 'react';
import { itemsApi } from './api';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const loadItems = () => {
    itemsApi
      .list()
      .then(setItems)
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await itemsApi.update(editingId, { name, description });
      } else {
        await itemsApi.create({ name, description });
      }
      resetForm();
      loadItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description ?? '');
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await itemsApi.remove(id);
      loadItems();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <h1>Items</h1>

      <form onSubmit={handleSubmit} className="item-form">
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">{editingId ? 'Actualizar' : 'Crear'}</button>
        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancelar
          </button>
        )}
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id}>
            <div>
              <strong>{item.name}</strong>
              {item.description && <span> — {item.description}</span>}
            </div>
            <div className="actions">
              <button onClick={() => handleEdit(item)}>Editar</button>
              <button onClick={() => handleDelete(item.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
