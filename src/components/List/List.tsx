import React, { useEffect, useMemo } from "react"
import positions from "../../data/positions.json"
import {
  Container,
  Box,
  CircularProgress,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Pagination,
  InputAdornment,
  TextField,
  Divider,
} from "@mui/material"
import FavoriteIcon from "@mui/icons-material/Favorite"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import ShareIcon from "@mui/icons-material/Share"
import { log } from "console"
import { filter } from "lodash"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"

const pageSize = 12

export const List = () => {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [items, setItems] = React.useState(positions)

  const [pageNum, setPageNum] = React.useState(0)
  const [itemsPaginated, setItemsPaginated] = React.useState(
    positions.slice(pageNum * pageSize, (pageNum + 1) * pageSize)
  )

  const initial: any = []

  const filters: { [key: string]: string[] } = positions.reduce((acc, val) => {
    val.tags
      .filter((t) => t.key !== "All")
      .forEach((tag) => {
        const values = [...(acc[tag.key] || []), ...tag.values]
        acc[tag.key] = Array.from(new Set(values))
      })
    return acc
  }, initial)

  const [filtersValues, setFiltersValues] = React.useState<{
    [key: string]: string
  }>({})

  const displayItems = () =>
    itemsPaginated.map((item, i) => (
      <Grid key={i} xs={12} sm={6} md={3} item>
        <Card sx={{ my: 1 }} variant="outlined">
          <CardHeader
            // avatar={
            //   <SmallProfileAvatar src={user?.photoURL} alt="profile">
            //     <UserCircleIcon fontSize="small" />
            //   </SmallProfileAvatar>
            // }
            action={
              <IconButton aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            }
            title={item.name}
            // subheader={timelapse}
            sx={{ textAlign: "left" }}
          />
          <CardMedia
            component="img"
            image={item ? item.img : ""}
            alt={item ? item.name : "unkown"}
          />
          <CardContent>
            <Typography
              sx={{
                textAlign: "left",
                mb: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: "3" /* number of lines to show */,
              }}
              variant="body2"
              color="text.secondary"
            >
              {item.description}
            </Typography>
          </CardContent>
          <CardActions disableSpacing>
            <IconButton aria-label="add to favorites">
              <FavoriteIcon />
            </IconButton>
            <IconButton aria-label="share">
              <ShareIcon />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    ))

  useEffect(() => {
    setItemsPaginated(items.slice(pageNum * pageSize, (pageNum + 1) * pageSize))
  }, [items, pageNum])

  useEffect(() => {
    const filteredItems = positions.filter((item) => {
      return (
        Object.keys(filtersValues).reduce((acc, key) => {
          return (
            acc &&
            (!filtersValues[key] ||
              item.tags.some(
                (t) => t.key === key && t.values.includes(filtersValues[key])
              ))
          )
        }, true) &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          !searchTerm)
      )
    })

    setItems(filteredItems)

    return () => {}
  }, [filtersValues, searchTerm])

  const onFilterChange = (key: string, value: string) => {
    setFiltersValues({ ...filtersValues, [key]: value })
  }

  const handleTermChange = (e: any) => {
    setSearchTerm(e.target.value)
  }

  return (
    <Container>
      <Grid columnSpacing={2} container>
        <Grid item xs={6} md={4}>
          <TextField
            fullWidth
            label="search"
            margin="dense"
            name="search"
            onChange={handleTermChange}
            type="search"
            value={searchTerm}
            variant="outlined"
            InputProps={{
              sx: { bgcolor: "backgorund.paper", color: "text.primary" },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        {Object.keys(filters).map((key) => (
          <Grid item xs={6} sm={4} md={2} key={key}>
            <FormControl fullWidth sx={{ minWidth: 80, mt: 1 }}>
              <InputLabel id={`${key}-select-label`}>{key}</InputLabel>
              <Select
                labelId={`${key}-select-label`}
                value={filtersValues ? filtersValues[key] || "" : ""}
                onChange={(e) => {
                  onFilterChange(key, e.target.value || "")
                }}
                label={key}
                fullWidth
                variant="filled"
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {filters[key]
                  .filter((k) => !!k)
                  .map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ my: 3 }} />
      <Grid spacing={2} container>
        {displayItems()}
        <Grid
          sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 3 }}
          item
          xs={12}
        >
          <Pagination
            count={Math.round(items.length / pageSize)}
            shape="rounded"
            onChange={(e, page) => {
              setPageNum(page)
            }}
          />
        </Grid>
      </Grid>
    </Container>
  )
}
