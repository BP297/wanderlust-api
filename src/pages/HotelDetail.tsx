import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Rating,
  Chip,
  ImageList,
  ImageListItem,
  Dialog,
  IconButton,
  Snackbar,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { hotelAPI } from '../services/api';
import { Hotel } from '../types';
import { useAuth } from '../contexts/AuthContext';

const HotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchHotel = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await hotelAPI.getById(id);
      setHotel(response.data.hotel);

      // 檢查是否已收藏
      if (user) {
        const favoritesResponse = await hotelAPI.getFavorites();
        const favoriteIds = favoritesResponse.data.hotels.map((h: Hotel) => h.id);
        setIsFavorite(favoriteIds.includes(id));
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '載入飯店資料失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotel();
  }, [id, user]);

  const handleFavorite = async () => {
    if (!user || !hotel) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await hotelAPI.removeFromFavorites(hotel.id);
        setIsFavorite(false);
        setSnackbar({
          open: true,
          message: '已從收藏中移除',
        });
      } else {
        await hotelAPI.addToFavorites(hotel.id);
        setIsFavorite(true);
        setSnackbar({
          open: true,
          message: '已加入收藏',
        });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: '操作失敗，請稍後再試',
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

  if (error || !hotel) {
    return (
      <Container sx={{ py: 8 }}>
        <Alert severity="error">{error || '找不到飯店資料'}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
          aria-label="返回"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
          {hotel.name}
        </Typography>
        <IconButton
          onClick={handleFavorite}
          sx={{
            '&:hover': {
              transform: 'scale(1.1)',
            },
            transition: 'transform 0.2s ease-in-out',
          }}
        >
          {isFavorite ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
      </Box>

      <Grid container spacing={4}>
        {/* 左側：圖片和基本資訊 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={hotel.rating} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({hotel.rating})
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" gutterBottom>
              {hotel.address}, {hotel.city}, {hotel.country}
            </Typography>

            <Typography variant="h5" color="primary" sx={{ mt: 2, mb: 3 }}>
              NT$ {hotel.price.toLocaleString()} /晚
            </Typography>

            <Typography variant="body1" paragraph>
              {hotel.description}
            </Typography>

            {/* 設施列表 */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                設施與服務
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {hotel.amenities.map((amenity, index) => (
                  <Chip key={index} label={amenity} />
                ))}
              </Box>
            </Box>
          </Paper>

          {/* 圖片列表 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              飯店照片
            </Typography>
            <ImageList cols={2} gap={16}>
              {hotel.images.map((image, index) => (
                <ImageListItem key={index}>
                  <img
                    src={image}
                    alt={`${hotel.name} - 照片 ${index + 1}`}
                    loading="lazy"
                    style={{ borderRadius: 8 }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Paper>
        </Grid>

        {/* 右側：房型資訊 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              可訂房型
            </Typography>
            {hotel.rooms.map((room, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 2,
                  '&:last-child': { mb: 0 },
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {room.type}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  剩餘房數：{room.available}
                </Typography>
                <Typography variant="h6" color="primary">
                  NT$ {room.price.toLocaleString()} /晚
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />

      {/* 圖片查看器 */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
            onClick={() => setSelectedImage(null)}
          >
            <CloseIcon />
          </IconButton>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="酒店圖片"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain',
              }}
            />
          )}
        </Box>
      </Dialog>
    </Container>
  );
};

export default HotelDetail; 