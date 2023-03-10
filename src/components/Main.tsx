import { ChangeEvent, FC, useEffect, useState } from "react";
import { RecipeCard } from "./RecipeCard";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import Navbar from "./Navbar";
import axios from "axios";
export interface Recipe {
  id: number;
  img: string;
  name: string;
  desc: string;
}
type Inputs = {
  name: string,
  img: string,
  desc: string,
};
const schema = yup.object({
  name: yup.string().required('Please enter name!'),
  img: yup.string().url('Please enter valid url!').required('Please enter website'),
  desc: yup.string().required('Please enter desc!')
}).required();
const recipesData: Recipe[] = [
  {
    id: 1,
    img:
      "https://img.freepik.com/free-photo/aloo-paratha-gobi-paratha-also-known-as-potato-cauliflower-stuffed-flatbread-dish-originating-from-indian-subcontinent_466689-76186.jpg?size=626&ext=jpg",
    name: "Aalu Paratha",
    desc: "Aloo Paratha are popular Indian flatbreads stuffed with a delicious spiced potato mixture.",
  },
  {
    id: 2,
    img: "https://thumbs.dreamstime.com/b/bhel-puri-23902772.jpg",
    name: "Bhel",
    desc: "Bhelpuri is a savoury snack originating from India, and is also a type of chaat. It is made of puffed rice, vegetables and a tangy tamarind sauce, and has a crunchy texture.",
  },
  {
    id: 3,
    img:
      "https://cdn.pixabay.com/photo/2017/12/09/08/18/pizza-3007395__480.jpg",
    name: "Pizza",
    desc: "Pizza is a dish of Italian origin consisting of a usually round, flat base of leavened wheat-based dough topped with tomatoes, cheese.",
  },
];
const Main: FC = () => {
  const { register, handleSubmit, watch, formState: { errors }, setValue, resetField } = useForm<Inputs>({
    resolver: yupResolver(schema)
  });
  const [state, setState] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<any>([]);
  const [editData, setEditData] = useState<any>();
  const getRecipes = async () => {
    const recipes = await axios.get(`${process.env.REACT_APP_SECRET_NAME}/v1/recipe/list`)
    setRecipes(recipes.data);
  }
  useEffect(() => {
    getRecipes();
  }, [])
  const handleShow = () => setState(true);

  const handleClose = () => {
    setState(false);
    resetField('name');
    resetField('img');
    resetField('desc');
    clearForm();
  };

  const clearForm = () => {
    setEditData(undefined);
  };

  const onEditHandler = (data: any) => {
    const { name, imgUrl, description } = data;
    setValue('name', name);
    setValue('img', imgUrl);
    setValue('desc', description);
    setEditData(data);
    handleShow();
  };

  const deleteRecipeHandler = async(id: any) => {
    console.log(id);
    const response = await axios.delete(`${process.env.REACT_APP_SECRET_NAME}/v1/recipe/${id}`);
    if (response) {
      getRecipes();
    }
    // setRecipes(recipes => recipes.filter(one=> one.id !== id))
  }

  const onSubmit: SubmitHandler<Inputs> = async (recipe: any) => {
    if (editData) {
      const response = await axios.put(`${process.env.REACT_APP_SECRET_NAME}/v1/recipe/${editData._id}`, recipe);
      if (response) {
        getRecipes();
      }
      const modifiedData = [...recipes];
      modifiedData.map((data: Recipe) => {
        if (data.id === editData._id) {
          data.name = recipe.name;
          data.img = recipe.imgUrl;
          data.desc = recipe.description;
        }
      });
      setRecipes(modifiedData);
    } else {
      const body = {
        name: recipe.name,
        desc: recipe.desc,
        img: recipe.img,
      }
      const response = await axios.post(`${process.env.REACT_APP_SECRET_NAME}/v1/recipe/create`, body)
      if (response) {
        getRecipes();
      }
    }
    clearForm();
    setState(false);
  }
  return (
    <>
      <Navbar />
      <div className="text-center mb-3">
        <Button variant="primary" onClick={handleShow}>
          Add Recipe
        </Button>
      </div>
      <Modal show={state} onHide={handleClose}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Header closeButton>
            <Modal.Title>{editData ? "Edit" : "Add"} Recipe</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Recipe Name
              </label>
              <input
                type="text"
                {...register("name")}
                className="form-control"
                id="exampleFormControlInput1"
                placeholder="pizza"
              />
              <p className="text-danger">{errors.name?.message}</p>

            </div>
            <div className="mb-3">
              <label htmlFor="exampleFormControlInput2" className="form-label">
                Image
              </label>
              <input
                type="text"
                {...register("img")}
                className="form-control"
                id="exampleFormControlInput2"
                placeholder="img url"
              />
              <p className="text-danger">{errors.img?.message}</p>
            </div>
            <div className="mb-3">
              <label htmlFor="exampleFormControlTextarea1" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="exampleFormControlTextarea1"
                rows={3}
                {...register("desc")}
                placeholder="Recipe Description."
              ></textarea>
              <p className="text-danger">{errors.desc?.message}</p>

            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleClose}>
              Close
            </Button>
            <Button variant="success" type="submit">
              Save
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {recipes.length && recipes.map((recipe: any) => (
          <RecipeCard
            key={recipe._id}
            recipe={recipe}
            onEditHandler={onEditHandler}
            deleteRecipeHandler={deleteRecipeHandler}
          ></RecipeCard>
        ))}
      </div>
    </>
  );
};

export default Main;
