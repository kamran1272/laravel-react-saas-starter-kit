<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Laravel\Sanctum\PersonalAccessToken;

class DashboardController extends Controller
{
    /**
     * Return high-level platform metrics, computed from the database.
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'total_users' => User::count(),
            'new_users_this_week' => User::where('created_at', '>=', now()->subWeek())->count(),
            'admins_count' => User::where('role', 'admin')->count(),
            'active_tokens' => PersonalAccessToken::count(),
        ]);
    }
}
