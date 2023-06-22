import React from 'react'
import Button from '../../user interface/Button';
import { useDispatch } from 'react-redux';
import { decreaseItemQuantity, increaseItemQuantity } from './cartSlice'
 function UpdateItemQuantity({pizzaId, currenQuantity}) {
  const dispatch = useDispatch();
  return (
    <div className='flex gap-2 items-center md:gap-3'>
        <Button type='round' onClick={() => dispatch(decreaseItemQuantity(pizzaId))}>-</Button>
        <span className='text-sm font-medium'>
          {currenQuantity}
        </span>
        <Button type='round' onClick={() => dispatch(increaseItemQuantity(pizzaId))}>+</Button>

    </div>
  );
}

export default UpdateItemQuantity;