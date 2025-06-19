import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const menuItems = (
    <>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
        個人資料
      </MenuItem>
      {user?.role === 'operator' && (
        <MenuItem onClick={() => { handleMenuClose(); navigate('/dashboard'); }}>
          管理面板
        </MenuItem>
      )}
      <Divider />
      <MenuItem onClick={handleLogout}>
        登出
      </MenuItem>
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={handleMobileMenuOpen}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Wanderlust Travel
          </Typography>

          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button color="inherit" component={RouterLink} to="/">
                首頁
              </Button>
              <Button color="inherit" component={RouterLink} to="/hotels">
                酒店
              </Button>
              {!user ? (
                <>
                  <Button color="inherit" component={RouterLink} to="/login">
                    登入
                  </Button>
                  <Button color="inherit" component={RouterLink} to="/register">
                    註冊
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" component={RouterLink} to="/favorites">
                    我的收藏
                  </Button>
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    sx={{ padding: 0.5 }}
                  >
                    <Avatar
                      alt={user.name}
                      src={user.profileImage}
                      sx={{ width: 32, height: 32 }}
                    />
                  </IconButton>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* 移動端選單 */}
      <Menu
        anchorEl={mobileMenuAnchorEl}
        open={Boolean(mobileMenuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { handleMenuClose(); navigate('/'); }}>
          首頁
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); navigate('/hotels'); }}>
          酒店
        </MenuItem>
        {user ? (
          <>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/favorites'); }}>
              我的收藏
            </MenuItem>
            {menuItems}
          </>
        ) : (
          <>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/login'); }}>
              登入
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/register'); }}>
              註冊
            </MenuItem>
          </>
        )}
      </Menu>

      {/* 桌面端用戶選單 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuItems}
      </Menu>

      <Container component="main" sx={{ flex: 1, py: 3 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Wanderlust Travel. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 