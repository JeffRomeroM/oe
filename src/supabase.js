import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hvgpyuxwvisnxgqbvipx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2Z3B5dXh3dmlzbnhncWJ2aXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMDMzODUsImV4cCI6MjA2NDU3OTM4NX0.7lSJBBsEp9CiQPx1DI1diKdWwfz363Un1EeiVfYHRz4'

export const supabase = createClient(supabaseUrl, supabaseKey)
