import { useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import { createOrder } from "../../services/apiRestaurant";
import Button from "../../user interface/Button";
import { useDispatch, useSelector } from "react-redux";
import EmptyCart from '../cart/EmptyCart'
import { clearCart, getCart, getTotalCartPrice } from '../cart/cartSlice'
import store from '../../store';
import { formatCurrency } from '../../utils/helpers.js';
import { fetchAddress } from "../user/userSlice";
// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str
  );



function CreateOrder() {
  const [withPriority, setWithPriority] = useState(false);
  const {username ,
     status: adressStatus,
      position,
       adress,
       error: errorAdress,
      } = useSelector((state) => state.user);

const isLoadingAdress = adressStatus === 'loading';

const navigation = useNavigation();
const isSubmitting = navigation.state === "Submitting";

const formErrors = useActionData();
const dispatch = useDispatch();


   
  const cart = useSelector(getCart);
const totalCartPrice = useSelector(getTotalCartPrice);
const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
const totalPrice = totalCartPrice + priorityPrice

if(!cart.length) return <EmptyCart />

  return (
    <div className="py-6 px-4">
      <h2 className="text-xl font-semibold mb-8">Ready to order? Let's go!</h2>
<button onClick={() =>dispatch(fetchAddress())}>Get position</button>


      <Form method="POST">
        <div className="mb-5 flex gap-2 flex-col sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input className="input grow w-full" type="text" name="customer" defaultValue={username} required />
        </div>

        <div className="mb-5 flex gap-2 flex-col sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow w-full">
            <input className="input w-full" type="tel" name="phone" required />
          
          {formErrors?.phone && <p className="text-xs mt-2 text-red-700 bg-red-100 p-2 rounded-full">{formErrors.phone}</p>}
          </div>
        </div>

        <div className="mb-5 flex gap-2 flex-col sm:flex-row sm:items-center relative">
          <label className="sm:basis-40">Address</label>
          <div className="grow w-full">
            <input className="input w-full" type="text" name="address" disabled={isLoadingAdress}
            defaultValue={adress}
             required />
             {adressStatus === 'error' && <p className="text-xs mt-2 text-red-700 bg-red-100 p-2 rounded-full">{errorAdress}</p>}
          </div>
          {!position.latitude && !position.longitude && <span className='absolute right-[3px] z-50 top-[3px] md:right-[5px]  md:top-[5px]'> 
          <Button type="small" disabled={isLoadingAdress} onClick={(e) =>{
            e.preventDefault();
            dispatch(fetchAddress())}}>Get position</Button>
          </span>}
         

        </div>

        <div className="mb-12 flex gap-5">
          <input className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2"
            type="checkbox"
            name="priority"
            id="priority"
             value={withPriority}
             onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority" className="font-medium">Want to yo give your order priority?</label>
        </div>

        <div>
        <input  type="hidden" name='cart' value={JSON.stringify(cart)}/>
        <input type='hidden' name="position" value={position.latitude && position.longitude ? `${position.latitude},${position.longitude}` : ''
        }

        />
          <Button disabled={isSubmitting || isLoadingAdress} type="primary"> {isSubmitting ? 'Placing order....' : `Order now from ${formatCurrency(totalPrice)}`}</Button>
        </div>
      </Form>
    </div>
  );
}

export async function action({request}) {
const formData = await request.formData();
const data = Object.fromEntries(formData);




const order = {
  ...data,
  cart: JSON.parse(data.cart),
  priority: data.priority === "true",
};


const errors = {};
if (!isValidPhone(order.phone)) errors.phone = 'Please give us your correct phone number. We might need it to contact you.';

if(Object.keys(errors).length > 0 ) return errors;

const newOrder = await createOrder(order);

store.dispatch(clearCart());

return redirect(`/order/${newOrder.id}`)
}

export default CreateOrder;
