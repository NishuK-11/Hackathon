import React from 'react'
import PharmacySidebar from '../../features/pharmacy/PharmacySidebar'

const PharmacyDashboard = () => {
  return (
    <div>
        <PharmacySidebar />
        <React.Suspense fallback={null}>
          <PharmacyDashboardOverviewAddOn />
        </React.Suspense>
    </div>
  )
}

export default PharmacyDashboard

// Added: lazy-load the pharmacy analytics feature without replacing the original dashboard/sidebar code.
const PharmacyDashboardOverviewAddOn = React.lazy(() =>
  import('../../features/pharmacy/PharmacyOverview')
)
