import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from '@mui/material';
import { GlassCard } from '@/components/common/GlassCard';
import SearchIcon from '@mui/icons-material/Search';
import ChairIcon from '@mui/icons-material/Chair';
import WeekendIcon from '@mui/icons-material/Weekend';
import BedIcon from '@mui/icons-material/Bed';
import TableBarIcon from '@mui/icons-material/TableBar';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import {
  fetchFurniture,
  searchFurniture,
  setSelectedCategory,
  setSearchTerm,
} from '@/features/furniture/furnitureSlice';
import type { FurnitureCategory } from '@/types/design.types';

type CategoryToggleValue = FurnitureCategory | 'all';

const CATEGORY_CONFIG: { value: CategoryToggleValue; label: string; icon: React.ReactElement }[] = [
  { value: 'all', label: 'All', icon: <Inventory2Icon fontSize="small" /> },
  { value: 'chair', label: 'Chairs', icon: <ChairIcon fontSize="small" /> },
  { value: 'sofa', label: 'Sofas', icon: <WeekendIcon fontSize="small" /> },
  { value: 'bed', label: 'Beds', icon: <BedIcon fontSize="small" /> },
  { value: 'table', label: 'Tables', icon: <TableBarIcon fontSize="small" /> },
  { value: 'storage', label: 'Storage', icon: <Inventory2Icon fontSize="small" /> },
];

const FurnitureCatalogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { furniture, selectedCategory, searchTerm, loading, error } = useSelector(
    (state: RootState) => state.furniture
  );

  useEffect(() => {
    dispatch(fetchFurniture());
  }, [dispatch]);

  const handleCategoryChange = (_event: React.MouseEvent<HTMLElement>, value: CategoryToggleValue | null) => {
    // When "All" is selected or toggle cleared, we store null in Redux
    if (!value || value === 'all') {
      dispatch(setSelectedCategory(null));
    } else {
      dispatch(setSelectedCategory(value));
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    dispatch(setSearchTerm(value));
    if (value.trim()) {
      dispatch(searchFurniture(value.trim()));
    } else {
      dispatch(fetchFurniture());
    }
  };

  const filteredFurniture = furniture.filter((item) =>
    selectedCategory ? item.category === selectedCategory : true
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom>
            Furniture Catalog
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Browse curated furniture pieces to design your perfect room.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
              alignItems: { xs: 'stretch', md: 'center' },
            }}
          >
            <TextField
              fullWidth
              placeholder="Search furniture by name..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 480 }}
            />

            <ToggleButtonGroup
              exclusive
              value={(selectedCategory ?? 'all') as CategoryToggleValue}
              onChange={handleCategoryChange}
              size="small"
              sx={{ flexWrap: 'wrap' }}
            >
              {CATEGORY_CONFIG.map((category) => (
                <ToggleButton
                  key={category.label}
                  value={category.value}
                  sx={{ textTransform: 'none', gap: 0.5, px: 1.5 }}
                >
                  {category.icon}
                  <Typography variant="body2">{category.label}</Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && filteredFurniture.length === 0 && (
          <GlassCard
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" gutterBottom>
              No furniture found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search, or check back later as we add more items.
            </Typography>
          </GlassCard>
        )}

        {!loading && !error && filteredFurniture.length > 0 && (
          <Grid container spacing={3}>
            {filteredFurniture.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <GlassCard
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={item.thumbnail}
                    alt={item.thumbnailAlt ?? item.name}
                    loading="lazy"
                    sx={{
                      height: 180,
                      objectFit: 'cover',
                      bgcolor: 'grey.200',
                    }}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {item.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip
                        size="small"
                        label={item.category}
                        sx={{ textTransform: 'capitalize' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {item.dimensions.width} × {item.dimensions.length} × {item.dimensions.height} m
                      </Typography>
                    </Box>
                    {item.price != null && (
                      <Typography variant="body2" fontWeight="medium">
                        ${item.price.toFixed(2)}
                      </Typography>
                    )}
                    {item.stock != null && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                      </Typography>
                    )}
                  </CardContent>
                </GlassCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default FurnitureCatalogPage;

