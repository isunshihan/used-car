import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyUser } from '@/lib/auth'

// 获取车辆列表
export async function GET(request: Request) {
  try {
    // 验证用户是否登录
    const user = await verifyUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 新增分页和搜索参数
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(Math.max(1, parseInt(searchParams.get('pageSize') || '5')), 100)
    const vin = searchParams.get('vin')
    const model = searchParams.get('model')
    const skip = (page - 1) * pageSize

    // 构建查询条件
    const where: any = {}
    if (vin) {
      where.vin = { contains: vin }
    }
    if (model) {
      where.vehicle_model = { contains: model }
    }

    // 获取总数和分页数据
    const [total, cars] = await prisma.$transaction([
      prisma.car_info.count({ where }),
      prisma.car_info.findMany({
        where,
        orderBy: { create_time: 'desc' },
        skip,
        take: pageSize
      })
    ])

    return NextResponse.json({
      data: cars,
      pagination: {
        current: page,
        pageSize,
        total
      }
    })
  } catch (error) {
    console.error('获取车辆列表失败:', error)
    return NextResponse.json({ error: '获取车辆列表失败' }, { status: 500 })
  }
}

// 添加新车辆
export async function POST(request: Request) {
  try {
    // 验证用户是否登录
    const user = await verifyUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取请求数据
    const data = await request.json()
    const { vin, vehicle_model, register_date, purchase_date, mileage } = data

    // 验证必填字段
    if (!vin || !vehicle_model || !register_date || !purchase_date || !mileage) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    // 创建新车辆记录
    const car = await prisma.car_info.create({
      data: {
        vin,
        vehicle_model,
        register_date: new Date(register_date),
        purchase_date: new Date(purchase_date),
        mileage: parseFloat(mileage),
        create_time: new Date(),
        update_time: new Date()
      }
    })

    return NextResponse.json(car)
  } catch (error) {
    console.error('添加车辆失败:', error)
    return NextResponse.json({ error: '添加车辆失败' }, { status: 500 })
  }
} 