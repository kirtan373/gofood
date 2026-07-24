const express=require('express');
const router=express.Router()
const Order=require('../models/Orders')
const User=require('../models/User')


router.post('/orderData',async(req,res)=>{
    const userEmail = req.body.email;
    if (userEmail) {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(403).json({ success: false, message: 'This account no longer exists. It has been permanently deleted.' });
        }
        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact support.' });
        }
    }

    let data=req.body.order_data
    const marker = {Order_date:req.body.order_date, status:'Pending'};
    if (req.body.deliveryInfo) {
        marker.deliveryInfo = req.body.deliveryInfo;
    }
    if (req.body.paymentMethod) {
        marker.paymentMethod = req.body.paymentMethod;
    }
    if (req.body.transactionId) {
        marker.transactionId = req.body.transactionId;
    }
    await data.splice(0,0,marker)

    let eId=await Order.findOne({'email':req.body.email})
    console.log(eId)
    if(eId === null){
        try{
            await Order.create({
                email:req.body.email,
                order_data:[data],
                status: 'Pending'
            }).then(()=>{
                res.json({success:true})
            })
        }catch(error){
            console.log(error.message)
            res.status(500).json({success:false, message:error.message})
        } 
    }
    else{
        try{
            await Order.findOneAndUpdate({email:req.body.email},
            { $push:{order_data:data}}).then(()=>{
                res.json({success:true})
            })
        } catch(error){
            res.status(500).json({success:false, message:error.message})
        }
    }
})

router.post('/check-first-order', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
        const existingOrder = await Order.findOne({ email });
        res.json({ success: true, isFirstOrder: !existingOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})

router.post('/myOrderData',async(req,res)=>{
    try{
        const userEmail = req.body.email;
        if (userEmail) {
            const user = await User.findOne({ email: userEmail });
            if (!user) {
                return res.status(403).json({ orderData: [], message: 'This account no longer exists. It has been permanently deleted.' });
            }
        }
        let myData=await Order.findOne({'email':req.body.email})
        if(!myData) return res.json({orderData:[]})
        const sessions = Array.isArray(myData.order_data) ? myData.order_data : [];
        const flattened = [];
        sessions.forEach((session, idx) => {
            if(!Array.isArray(session)) return;
            const marker = session.find(i => i && i.Order_date);
            const items = session.filter(i => i && !i.Order_date);
            const total = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
            flattened.push({
                _id: `${myData._id}__${idx}`,
                order_date: marker?.Order_date || null,
                items,
                total,
                status: marker?.status || myData.status || 'Pending',
                deliveryInfo: marker?.deliveryInfo || null,
                paymentMethod: marker?.paymentMethod || null,
                transactionId: marker?.transactionId || null,
            });
        });
        flattened.sort((a, b) => {
            const da = a.order_date ? new Date(a.order_date).getTime() : 0;
            const db = b.order_date ? new Date(b.order_date).getTime() : 0;
            return db - da;
        });
        res.json({orderData: flattened})
    }catch(error){
        res.status(500).json({orderData:[], message: error.message})
    }
})
module.exports=router;