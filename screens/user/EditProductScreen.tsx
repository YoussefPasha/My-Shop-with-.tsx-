import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import { HeaderButtonCmp, Input } from "../../components";
import Colors from "../../constants/Colors";
import * as productActions from "../../store/actions/products";

const styles = StyleSheet.create({
  form: {
    margin: 20,
  },
  formControl: {
    width: "100%",
  },
  label: {
    fontFamily: "bold",
    marginVertical: 8,
  },
  input: {
    paddingHorizontal: 2,
    paddingVertical: 5,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
});

// Constants with useReducer React hook
const FORM_UPDATE = "FORM_UPDATE";

// function to reduce form
const formReducer = (state: any, action: any) => {
  if (action.type === FORM_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value,
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid,
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      formIsValid: updatedFormIsValid,
      inputValidities: updatedValidities,
      inputValues: updatedValues,
    };
  }
  return state;
};

const EditProductScreen = (props: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const productId = props.route.params.productId;
  let editedProduct: any;
  if (productId) {
    editedProduct = useSelector((state: any) =>
      state.products.userProducts.find((prod: any) => prod.id === productId)
    );
  }
  const { setOptions, navigate } = props.navigation;
  const dispatch = useDispatch();

  // Validation With use Reducer

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      title: editedProduct ? editedProduct.title : "",
      imageUrl: editedProduct ? editedProduct.imageUrl : "",
      price: "",
      description: editedProduct ? editedProduct.description : "",
    },
    inputValidities: {
      title: editedProduct ? true : false,
      imageUrl: editedProduct ? true : false,
      description: editedProduct ? true : false,
      price: editedProduct ? true : false,
    },
    formIsValid: editedProduct ? true : false,
  });

  useEffect(() => {
    if (error) {
      Alert.alert("An error occurred!", error, [{ text: "Okay" }]);
    }
  }, [error]);

  const actionsHere = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      if (productId) {
        await dispatch(
          productActions.updateProduct(
            productId,
            formState.inputValues.title,
            formState.inputValues.description,
            formState.inputValues.imageUrl
          )
        );
      } else {
        await dispatch(
          productActions.createProduct(
            formState.inputValues.title,
            formState.inputValues.description,
            formState.inputValues.imageUrl,
            +formState.inputValues.price
          )
        );
      }
      navigate("UserProducts");
    } catch (error) {
      setError(error.message);
    }
    setIsLoading(false);
  }, [dispatch, error, setIsLoading, setError, formState, navigate]);

  useEffect(() => {
    setOptions({
      headerTitle: () =>
        productId ? (
          <Text
            style={{
              fontFamily: "bold",
              fontSize: 24,
              color: Platform.OS === "android" ? "white" : Colors.primary,
            }}
          >
            Edit Product
          </Text>
        ) : (
          <Text
            style={{
              fontFamily: "bold",
              fontSize: 24,
              color: Platform.OS === "android" ? "white" : Colors.primary,
            }}
          >
            Add Product
          </Text>
        ),
      headerRight: () => (
        <HeaderButtons HeaderButtonComponent={HeaderButtonCmp}>
          <Item
            title="Save"
            iconName={
              Platform.OS === "android" ? "md-checkmark" : "ios-checkmark"
            }
            onPress={() => {
              if (!formState.formIsValid) {
                Alert.alert(
                  "Wrong Input",
                  "Please check the errors in the form.",
                  [{ text: "Okay" }]
                );
                return;
              }
              actionsHere();
            }}
            buttonStyle={{ fontSize: 30, fontFamily: "bold" }}
          />
        </HeaderButtons>
      ),
    });
  }, [productId, productActions, formState, actionsHere]);

  const inputChangeHandler = useCallback(
    (inputIdentifier: string, inputValue: string, inputValidity: boolean) => {
      dispatchFormState({
        type: FORM_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        input: inputIdentifier,
      });
    },
    [dispatchFormState]
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior="height"
      keyboardVerticalOffset={50}
      style={{ flex: 1 }}
    >
      <ScrollView>
        <View style={styles.form}>
          <Input
            keyboardType="default"
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="next"
            label="Title"
            errorText="Please enter a valid title!"
            onInputChange={inputChangeHandler}
            initialValue={editedProduct ? editedProduct.title : ""}
            initiallyValid={!!editedProduct}
            required
            id="title"
          />
          <Input
            id="imageUrl"
            keyboardType="default"
            returnKeyType="next"
            label="Image Url"
            onInputChange={inputChangeHandler}
            errorText="Please enter a valid image url!"
            initialValue={editedProduct ? editedProduct.imageUrl : ""}
            required
            initiallyValid={!!editedProduct}
          />
          {editedProduct ? null : (
            <Input
              id="price"
              keyboardType="decimal-pad"
              returnKeyType="next"
              label="Price"
              onInputChange={inputChangeHandler}
              required
              errorText="Please enter a valid price!"
              min={0.1}
            />
          )}
          <Input
            id="description"
            keyboardType="default"
            autoCapitalize="sentences"
            autoCorrect
            label="Description"
            onInputChange={inputChangeHandler}
            errorText="Please enter a valid description!"
            multiline
            numberOfLines={3}
            initialValue={editedProduct ? editedProduct.description : ""}
            required
            initiallyValid={!!editedProduct}
            minLength={5}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProductScreen;
