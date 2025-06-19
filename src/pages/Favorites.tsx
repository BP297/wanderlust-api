import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Rating,
  Button,
  Snackbar,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { hotelAPI } from '../services/api';
import { Hotel } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Favorites: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await hotelAPI.getFavorites();
      setHotels(response.data.hotels);
    } catch (error: any) {
      setError(error.response?.data?.message || '載入收藏飯店失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (hotelId: string) => {
    try {
      await hotelAPI.removeFromFavorites(hotelId);
      setHotels(hotels.filter(hotel => hotel.id !== hotelId));
      setSnackbar({
        open: true,
        message: '已從收藏中移除',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: '移除收藏失敗',
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
          aria-label="返回"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          我的收藏
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {hotels.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            您還沒有收藏任何飯店
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/hotels')}
            sx={{ mt: 2 }}
          >
            瀏覽飯店
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {hotels.map((hotel) => (
            <Grid item key={hotel.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
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
                  onClick={() => handleRemoveFavorite(hotel.id)}
                >
                  <FavoriteIcon color="error" />
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
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default Favorites; 