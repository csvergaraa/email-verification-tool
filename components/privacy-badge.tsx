import { Shield, Lock, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function PrivacyBadge() {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-green-100 p-3">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-green-900">100% Private & Secure</h3>
            <div className="space-y-1.5 text-sm text-green-800">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>No data is stored in any database</span>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span>All emails are processed in memory and immediately discarded</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>GDPR compliant - zero data retention</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
