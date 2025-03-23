const express = require('express')
const connectDB = require('../config/database');
const { ObjectId } = require('mongodb')

exports.listPage = async (req, res) => {
    const db = await connectDB();
    const result = await db.collection('post').find().toArray()
    res.render('post/list.ejs', { post: result })
}

exports.writePage = (req, res) => {
    res.render('post/write.ejs')
}

exports.postAdd = async (req, res) => {
    // console.log(req.body)
    try {
        const db = await connectDB();
        const { title, content } = req.body;
        if(!title || !content) {
            return res.status(401).json({ message: '글자를 적으세요' });
        }
        const imageURL = req.file?.location || null;
        await db.collection('post').insertOne({
            title, 
            content, 
            imageURL, 
            userId: req.user.id, // 👈 로그인된 유저의 id 저장!
            date: new Date() 
        })
        res.redirect('/list')
    } catch(error) {
        console.log('DB에러:', error);
        res.status(500).json({ message: 'DB연결 실패:', error})
    }
    
}

exports.detailPage = async (req, res) => {
    // console.log(req.params)
    try {
        const db = await connectDB();
        const postId = req.params.id
        if(!ObjectId.isValid(postId)) {
            console.log(error);
            return res.status(401).json({ message: 'error:', error})
        }
        const result = await db.collection('post').findOne({ _id: new ObjectId(postId) });
        res.render('post/detail', { post: result })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'DB연결 실패:', error})
    }
    
}

exports.editPage = async (req, res) => {
    // console.log(req.params)
    try {
        const db = await connectDB();
        const postId = req.params.id
        const result = await db.collection('post').findOne({ _id: new ObjectId(postId) })

        // ✅ 여기서 권한 체크! // ✅ userId가 없을 경우도 체크!
        const userObjectId = new ObjectId(req.user.id)
        if (!result.userId || !result.userId.equals(userObjectId)) {
            return res.status(403).send('본인 게시글만 수정 가능합니다.');
        }

        res.render('post/edit.ejs', { post: result })
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: 'error:', error })
    }
}

exports.postEdit = async (req, res) => {
    try {
        const db = await connectDB();
        const postId = req.body.id
        const { title, content } = req.body;
        if(!title || !content) {
            return res.status(400).send('글자를 적어주세요')
        }

        // 1. 기존 게시물 가져오기
        const existingPost = await db.collection('post').findOne({ _id: new ObjectId(postId)})


        // ✅ 여기서 권한 체크!
        const userObjectId = new ObjectId(req.user.id)
        if (!existingPost.userId || !existingPost.userId.equals(userObjectId)) {
            return res.status(403).send('본인 게시글만 수정 가능합니다.');
        }

        // 2. 새 파일 있으면 사용, 없으면 기존 이미지 유지
        const imageURL = req.file?.location || existingPost.imageURL;
        console.log('req file:', req.file)
        console.log('기존 imageURL', existingPost.imageURL)
        console.log('최종 저장될 imageURL:', imageURL)
        await db.collection('post').updateOne(
            {_id: new ObjectId(postId) },
            { $set: { title, content, imageURL, updateDate: new Date() } }
    );
        res.redirect('/list')
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: 'DB연결 실패:', error})
    }
}

exports.delete = async (req, res) => {
    try {
        const postId = req.query.docid
        const db = await connectDB();
        
        const existingPost = await db.collection('post').findOne({ _id: new ObjectId(postId) });
    
        console.log('로그인 유저 아이디:', req.user.id);
        console.log('게시물 유저 Id:', existingPost.userId)

        const userObjectId = new ObjectId(req.user.id);
        if (!existingPost.userId || !existingPost.userId.equals(userObjectId)) {
            return res.status(403).send('본인 게시글만 삭제 가능합니다.');
        }

        await db.collection('post').deleteOne({_id : new ObjectId(postId) })
        console.log('✅ 삭제 성공');
        return res.send('삭제완료')
    } catch(error) {
        console.log('에러발생:', error);
        return res.status(500).json({ message: 'error:', error})
    }
    
}