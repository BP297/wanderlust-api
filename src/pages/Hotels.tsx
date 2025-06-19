import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid as MuiGrid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Rating,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import { hotelAPI } from '../services/api';
import { Hotel } from '../types';
import { useAuth } from '../contexts/AuthContext';

// 創建一個類型安全的 Grid 組件
const Grid = MuiGrid as typeof MuiGrid;

const Hotels: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hotelAPI.getAll({
        search: searchTerm,
      });
      setHotels(response.data.hotels);
    } catch (error: any) {
      setError(error.response?.data?.message || '載入飯店資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    try {
      const response = await hotelAPI.getFavorites();
      const favoriteIds = response.data.hotels.map((hotel: Hotel) => hotel.id);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('載入收藏資料失敗:', error);
      setFavorites([]);
    }
  };

  useEffect(() => {
    fetchHotels();
    fetchFavorites();
  }, [user]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    fetchHotels();
  };

  const handleFavorite = async (hotelId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (favorites.includes(hotelId)) {
        await hotelAPI.removeFromFavorites(hotelId);
        setFavorites(favorites.filter(id => id !== hotelId));
        setSnackbar({
          open: true,
          message: '已從收藏中移除',
          severity: 'success',
        });
      } else {
        await hotelAPI.addToFavorites(hotelId);
        setFavorites([...favorites, hotelId]);
        setSnackbar({
          open: true,
          message: '已加入收藏',
          severity: 'success',
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: '操作失敗，請稍後再試',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 8 }} maxWidth="lg">
      {/* 搜尋欄 */}
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ mb: 4 }}
      >
        <TextField
          fullWidth
          placeholder="搜尋飯店名稱、地點..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* 飯店列表 */}
      <Grid container spacing={4}>
        {hotels.map((hotel) => (
          <Grid item xs={12} sm={6} md={4} key={hotel.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[4],
                },
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  height: 200,
                  cursor: 'pointer',
                }}
                image={hotel.images[0] || 'https://source.unsplash.com/random/800x600/?hotel'}
                alt={hotel.name}
                onClick={() => navigate(`/hotels/${hotel.id}`)}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'background.paper',
                    transform: 'scale(1.1)',
                  },
                  transition: 'transform 0.2s ease-in-out',
                }}
                onClick={() => handleFavorite(hotel.id)}
                aria-label={favorites.includes(hotel.id) ? '取消收藏' : '加入收藏'}
              >
                {favorites.includes(hotel.id) ? (
                  <FavoriteIcon color="error" />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
              <CardContent sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate(`/hotels/${hotel.id}`)}>
                <Typography gutterBottom variant="h6" component="h2" noWrap>
                  {hotel.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={hotel.rating} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({hotel.rating})
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {hotel.city}, {hotel.country}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  NT$ {hotel.price.toLocaleString()} /晚
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Hotels; 