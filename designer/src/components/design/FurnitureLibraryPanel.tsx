import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChairIcon from '@mui/icons-material/Chair';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store';
import { fetchFurniture, setSelectedCategory, setSearchTerm } from '@/features/furniture/furnitureSlice';
import { addFurnitureToDesign } from '@/features/design/designSlice';
import { FurnitureCategory } from '@/types/design.types';

const categories: Array<{ value: FurnitureCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'chair', label: 'Chairs' },
  { value: 'table', label: 'Tables' },
  { value: 'sofa', label: 'Sofas' },
  { value: 'bed', label: 'Beds' },
  { value: 'storage', label: 'Storage' },
];

export const FurnitureLibraryPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { furniture, selectedCategory, searchTerm, isLoading, error } = useSelector(
    (state: RootState) => state.furniture
  );
  const currentDesign = useSelector((state: RootState) => state.design.currentDesign);
  
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    dispatch(fetchFurniture());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchTerm(localSearchTerm));
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchTerm, dispatch]);

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: FurnitureCategory | 'all') => {
    dispatch(setSelectedCategory(newValue === 'all' ? null : newValue));
  };

  const handleAddFurniture = (furnitureId: string) => {
    if (!currentDesign) {
      return;
    }

    const furnitureItem = furniture.find((f) => f._id === furnitureId);
    if (!furnitureItem) return;

    const roomCenterX = currentDesign.room.width / 2;
    const roomCenterY = currentDesign.room.length / 2;

    dispatch(
      addFurnitureToDesign({
        furnitureId,
        position: { x: roomCenterX, y: roomCenterY },
        rotation: 0,
        scale: 1,
        color: furnitureItem.defaultColor,
      })
    );
  };

  const filteredFurniture = furniture.filter((item) => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDragStart = (e: React.DragEvent, furnitureId: string) => {
    e.dataTransfer.setData('furnitureId', furnitureId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Furniture Library
          </Typography>
          <Tooltip title="Click furniture to add to center of room, or drag to specific position">
            <InfoOutlinedIcon fontSize="small" color="action" />
          </Tooltip>
        </Box>
        
        <Tooltip title="Search by furniture name or category">
          <TextField
            fullWidth
            size="small"
            placeholder="Search furniture..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </Tooltip>

        <Tabs
          value={selectedCategory || 'all'}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 40 }}
        >
          {categories.map((cat) => (
            <Tab
              key={cat.value}
              label={cat.label}
              value={cat.value}
              sx={{ minHeight: 40, py: 1 }}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {isLoading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isLoading && !error && furniture.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              px: 2,
              textAlign: 'center',
            }}
          >
            <ChairIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Furniture Available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
              The furniture catalog is empty. Please contact your administrator to add furniture items.
            </Typography>
          </Box>
        )}

        {!isLoading && !error && furniture.length > 0 && filteredFurniture.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6,
              px: 2,
              textAlign: 'center',
            }}
          >
            <SearchIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Results Found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
              Try adjusting your search or category filter to find furniture.
            </Typography>
          </Box>
        )}

        {!isLoading && !error && filteredFurniture.length > 0 && (
          <Grid container spacing={2}>
            {filteredFurniture.map((item) => (
              <Grid item xs={12} key={item._id}>
                <Tooltip title="Click to add to room center, or drag to position" placement="left">
                  <Card
                    draggable
                    onDragStart={(e) => handleDragStart(e, item._id)}
                    onClick={() => handleAddFurniture(item._id)}
                    sx={{
                      cursor: 'grab',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                      '&:active': {
                        transform: 'scale(0.98)',
                        cursor: 'grabbing',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CardMedia
                        component="img"
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          bgcolor: 'grey.100',
                        }}
                        image={item.thumbnail}
                        alt={item.name}
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='100%25' height='100%25' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      <CardContent sx={{ flex: 1, py: 1.5 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {item.dimensions.width}m × {item.dimensions.length}m × {item.dimensions.height}m
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{ textTransform: 'capitalize', height: 20, fontSize: '0.7rem' }}
                          />
                          {item.price && (
                            <Chip
                              label={`$${item.price.toFixed(2)}`}
                              size="small"
                              color="primary"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                          {item.isColorizable && (
                            <Tooltip title="Color can be customized">
                              <Chip
                                label="Colorizable"
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </CardContent>
                    </Box>
                  </Card>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {!currentDesign && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'warning.light',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="warning.dark">
            Create or load a design to add furniture
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FurnitureLibraryPanel;
