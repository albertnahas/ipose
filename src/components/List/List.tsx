import React, { useEffect } from "react"
import positions from "../../data/positions.json"
import {
  Container,
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
  CardActionArea,
  Chip,
  Avatar,
  Stack,
  useTheme,
} from "@mui/material"
import FavoriteIcon from "@mui/icons-material/Favorite"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import ShareIcon from "@mui/icons-material/Share"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"
import { Box } from "@mui/system"
import ModalDialog from "../../molecules/ModalDialog/ModalDialog"
import { Position } from "../../types/position"
import { useSelector } from "react-redux"
import { userSelector } from "../../store/userSlice"
import { useUser } from "../../hooks/useUser"

const pageSize = 12

export const List = () => {
  const user = useSelector(userSelector)
  const { updateUser } = useUser()

  const [items, setItems] = React.useState<Position[]>(positions)
  const [selectedItem, setSelectedItem] = React.useState<Position>()
  const [openSelectedModal, setOpenSelectedModal] = React.useState(false)

  const [searchTerm, setSearchTerm] = React.useState("")
  const [filtersValues, setFiltersValues] = React.useState<{
    [key: string]: string
  }>({})

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

  const onLike = (position: Position) => {
    if (user?.likes?.includes(position.name)) {
      updateUser({
        ...user,
        likes: user.likes.filter((l) => l !== position.name),
      })
    } else {
      updateUser({ ...user, likes: [...(user?.likes || []), position.name] })
    }
  }

  const theme = useTheme()

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
          <CardActionArea onClick={() => setSelectedItem(item)}>
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
          </CardActionArea>
          <CardActions disableSpacing>
            <IconButton
              onClick={() => onLike(item)}
              aria-label="add to favorites"
            >
              {user?.likes?.includes(item.name) ? (
                <FavoriteIcon
                  sx={{
                    color: theme.palette.error.light,
                  }}
                />
              ) : (
                <FavoriteIcon
                  sx={{
                    color: theme.palette.action.active,
                  }}
                />
              )}
            </IconButton>
            <IconButton aria-label="share">
              <ShareIcon />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    ))

  useEffect(() => {
    setOpenSelectedModal(!!selectedItem)
  }, [selectedItem])

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
      {selectedItem && (
        <ModalDialog open={openSelectedModal} setOpen={setOpenSelectedModal}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h4" color="text.secondary">
              {selectedItem.name}
            </Typography>
            <img
              style={{ display: "block", margin: "auto", maxWidth: "90%" }}
              width="350"
              src={selectedItem.img}
              alt={selectedItem.name}
            />
            <Typography sx={{ my: 2 }} variant="body2" color="text.secondary">
              {selectedItem.description}
            </Typography>
            {selectedItem.tags.map((tag) => (
              <Chip
                key={tag.key}
                label={`${tag.key}: ${tag.values.join(", ")}`}
                variant="outlined"
                size="small"
                sx={{
                  mr: 1,
                  mb: 1,
                  backgroundColor: "background.paper",
                  color: "text.primary",
                }}
              />
            ))}
            <Stack spacing={3} sx={{ my: 1, flexWrap: "wrap" }} direction="row">
              {selectedItem.similars.map((similar) => (
                <Stack key={similar} sx={{ alignItems: "center" }}>
                  <Avatar
                    sx={{
                      width: 70,
                      height: 70,
                      border: "2px solid lightgrey",
                    }}
                  >
                    <img
                      src={positions.find((p) => p.name === similar)?.img}
                      alt={similar}
                      style={{ width: "140%" }}
                    />
                  </Avatar>
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    {similar}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </ModalDialog>
      )}
    </Container>
  )
}
