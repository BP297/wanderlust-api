import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box>
      {/* 英雄區塊 */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Wanderlust Travel
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph>
            探索世界的每個角落，讓我們為您打造完美的旅程。
            無論是豪華度假村還是精品民宿，這裡都能找到最適合您的住宿選擇。
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              component={RouterLink}
              to="/hotels"
              size="large"
            >
              瀏覽酒店
            </Button>
            {!user && (
              <Button
                variant="outlined"
                component={RouterLink}
                to="/register"
                size="large"
              >
                立即註冊
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* 特色服務 */}
      <Container sx={{ py: 8 }} maxWidth="md">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardMedia
                component="img"
                sx={{
                  height: 200,
                }}
                image="https://source.unsplash.com/random/800x600/?hotel"
                alt="精選酒店"
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  精選酒店
                </Typography>
                <Typography>
                  嚴選全球頂級酒店，為您提供最舒適的住宿體驗。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardMedia
                component="img"
                sx={{
                  height: 200,
                }}
                image="https://source.unsplash.com/random/800x600/?service"
                alt="專業服務"
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  專業服務
                </Typography>
                <Typography>
                  24小時客服支援，隨時為您解答問題並提供協助。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <CardMedia
                component="img"
                sx={{
                  height: 200,
                }}
                image="https://source.unsplash.com/random/800x600/?discount"
                alt="優惠折扣"
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  優惠折扣
                </Typography>
                <Typography>
                  會員專屬優惠，讓您以最優惠的價格享受頂級服務。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 