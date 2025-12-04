"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <Button className="bg-red-600">Logout</Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card className="shadow">
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">142</p>
            <p className="text-sm text-gray-500">Registered in Hostel</p>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardHeader>
            <CardTitle>Available Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">18</p>
            <p className="text-sm text-gray-500">Out of 160</p>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardHeader>
            <CardTitle>Pending Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
            <p className="text-sm text-gray-500">Need attention</p>
          </CardContent>
        </Card>

        <Card className="shadow">
          <CardHeader>
            <CardTitle>Receipts Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">9</p>
            <p className="text-sm text-gray-500">Fee receipt not uploaded</p>
          </CardContent>
        </Card>

      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Students Section */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Student Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/students">
              <Button className="w-full">View Students</Button>
            </Link>
            <Link href="/admin/admission-requests">
              <Button variant="secondary" className="w-full">
                Admission Requests
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Complaints Section */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Complaint Box</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/complaints">
              <Button className="w-full">View Complaints</Button>
            </Link>
            <Button variant="secondary" className="w-full">
              Mark All Resolved
            </Button>
          </CardContent>
        </Card>

        {/* Mess Controls */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Mess Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/mess/menu">
              <Button className="w-full">Update Menu</Button>
            </Link>
            <Link href="/admin/mess/feedback">
              <Button variant="secondary" className="w-full">
                View Feedback
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Notice Section */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Notice Board</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/notices">
              <Button className="w-full">Manage Notices</Button>
            </Link>
            <Input placeholder="Quick Notice" className="mt-2" />
            <Button className="w-full mt-2">Post Notice</Button>
          </CardContent>
        </Card>

      </div>

      {/* Recent Activity */}
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-gray-700">
            <li>• 3 New Complaints Registered</li>
            <li>• Mess Menu Updated</li>
            <li>• 5 New Admission Requests</li>
            <li>• Room 204 Allocated to Rahul Kumar</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
